from flask import Blueprint,request, jsonify
from app import app, db
from app.models import User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import cross_origin


auth_bp = Blueprint('auth', __name__)

@app.route('/api/signup', methods=['POST'])
@cross_origin()
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered."}), 400

    hashed_pw = generate_password_hash(password)
    user = User(email=email, password=hashed_pw)
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Signup successful."}), 201


@app.route('/api/login', methods=['POST'])
@cross_origin()
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password, password):
        return jsonify({
            "message": "Login successful",
            "user_id": user.id
        }), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401


@app.route('/api/user/profile', methods=['PUT'])
@cross_origin()
def update_profile():
    data = request.json
    user_id = data.get('user_id')

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.name = data.get('name', user.name)
    user.profession = data.get('profession', user.profession)
    user.company = data.get('company', user.company)
    user.location = data.get('location', user.location)
    user.age = data.get('age', user.age)
    user.gender = data.get('gender', user.gender)

    db.session.commit()

    return jsonify({"message": "Profile updated."}), 200


@app.route('/api/user/profile', methods=['GET'])
@cross_origin()
def get_profile():
    user_id = request.args.get('user_id')
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "name": user.name,
        "profession": user.profession,
        "company": user.company,
        "location": user.location,
        "age": user.age,
        "gender": user.gender
    }), 200
