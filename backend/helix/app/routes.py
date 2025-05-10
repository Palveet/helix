from flask import request, jsonify
from app import app, db
from app.models import Sequence
from app import socketio
from flask_cors import cross_origin
from app.services.openai_service import (
    analyze_user_intent,
    generate_sequence,
    edit_sequence,
    generate_title_from_context
)

session_state = {}

@app.route('/api/sequences/<user_id>', methods=['GET'])
@cross_origin()
def get_sequences(user_id):
    try:
        sequences = Sequence.query.filter_by(user_id=user_id).all()
        return jsonify([{
            "id": seq.id,
            "user_id": seq.user_id,
            "title": seq.title,
            "content": seq.content
        } for seq in sequences])
    except Exception as e:
        print(f"Error fetching sequences: {str(e)}")
        return jsonify({"error": "Failed to fetch sequences"}), 500

@app.route('/api/sequence/<sequence_id>', methods=['PUT', 'DELETE'])
@cross_origin()
def manage_sequence(sequence_id):
    try:
        user_id = request.args.get('user_id')
        sequence = Sequence.query.filter_by(id=sequence_id, user_id=user_id).first()
        if not sequence:
            return jsonify({"error": "Sequence not found"}), 404

        if request.method == 'DELETE':
            db.session.delete(sequence)
            db.session.commit()
            return jsonify({"message": "Sequence deleted successfully"})
            
        elif request.method == 'PUT':
            data = request.json
            updated_content = data.get('updated_content')
            
            if not updated_content:
                return jsonify({"error": "No content provided"}), 400
                
            sequence.content = updated_content
            db.session.commit()
            
            socketio.emit('sequence_updated', {
                "id": sequence.id,
                "user_id": sequence.user_id,
                "title": sequence.title,
                "content": sequence.content
            })
            
            return jsonify({
                "message": "Sequence updated successfully",
                "sequence": {
                    "id": sequence.id,
                    "user_id": sequence.user_id,
                    "title": sequence.title,
                    "content": sequence.content
                }
            })
            
    except Exception as e:
        print(f"Error managing sequence: {str(e)}")
        return jsonify({"error": f"Failed to {request.method.lower()} sequence"}), 500

@app.route('/api/chat', methods=['POST'])
@cross_origin()
def chat():
    try:
        data = request.json
        user_id = data.get('user_id', 'default')
        message = data.get('message', '')
        conversation_context = data.get('conversation_context', [])

        if not message:
            return jsonify({"error": "No message provided"}), 400

        if user_id not in session_state:
            session_state[user_id] = {
                'last_sequence': '',
                'last_sequence_id': None,
                'context': []
            }

        user_session = session_state[user_id]
        
        action, system_reply = analyze_user_intent(message, conversation_context)

        if action == "chat":

            user_session['context'] = conversation_context + [
                {"role": "user", "content": message},
                {"role": "assistant", "content": system_reply}
            ]
            return jsonify({"message": system_reply})

        elif action == "generate_sequence":
            # print("trigged")
            try:
                generated_sequence = generate_sequence(message, conversation_context)
                if not generated_sequence:
                    return jsonify({"error": "Failed to generate sequence"}), 500

                title = generate_title_from_context(message, conversation_context)
                
                sequence = Sequence(
                    user_id=user_id,
                    title=title or "New Sequence",
                    content=generated_sequence
                )
                db.session.add(sequence)
                db.session.commit()

                user_session['last_sequence'] = generated_sequence
                user_session['last_sequence_id'] = sequence.id
                user_session['context'] = conversation_context + [
                    {"role": "user", "content": message},
                    {"role": "assistant", "content": "I've created a sequence based on our discussion."}
                ]

                socketio.emit('sequence_updated', {
                    "id": sequence.id,
                    "user_id": sequence.user_id,
                    "title": sequence.title,
                    "content": sequence.content
                })

                return jsonify({
                    "message": "I've created a sequence based on our discussion. Let me know if you'd like any changes.",
                    "sequence": {
                        "id": sequence.id,
                        "title": sequence.title,
                        "content": sequence.content
                    }
                })

            except Exception as e:
                print(f"Error generating sequence: {str(e)}")
                return jsonify({"error": "Failed to generate sequence"}), 500

        elif action == "edit_sequence":
            try:
                if not user_session['last_sequence'] or not user_session['last_sequence_id']:
                    last_seq = Sequence.query.filter_by(user_id=user_id).order_by(Sequence.id.desc()).first()
                    if last_seq:
                        user_session['last_sequence'] = last_seq.content
                        user_session['last_sequence_id'] = last_seq.id
                    else:
                        return jsonify({"error": "No sequence found to edit"}), 404

                edited_content = edit_sequence(
                    user_session['last_sequence'],
                    message,
                    conversation_context
                )
                if not edited_content:
                    return jsonify({"error": "Failed to edit sequence"}), 500

                sequence = Sequence.query.get(user_session['last_sequence_id'])
                if sequence:
                    sequence.content = edited_content
                    db.session.commit()

                    user_session['last_sequence'] = edited_content
                    user_session['context'] = conversation_context + [
                        {"role": "user", "content": message},
                        {"role": "assistant", "content": "I've updated the sequence based on your feedback."}
                    ]

                    socketio.emit('sequence_updated', {
                        "id": sequence.id,
                        "user_id": sequence.user_id,
                        "title": sequence.title,
                        "content": sequence.content
                    })

                    return jsonify({
                        "message": "I've updated the sequence. How does it look now?",
                        "sequence": {
                            "id": sequence.id,
                            "title": sequence.title,
                            "content": sequence.content
                        }
                    })
                else:
                    return jsonify({"error": "Sequence not found"}), 404

            except Exception as e:
                print(f"Error editing sequence: {str(e)}")
                return jsonify({"error": "Failed to edit sequence"}), 500

        else:
            return jsonify({"message": system_reply})

    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
