import openai
import json

def analyze_user_intent(message, conversation_context=None):
    lower_message = message.lower()
    
    if ("edit" in lower_message or "add" in lower_message or "change" in lower_message or "modify" in lower_message) and ("step" in lower_message or "sequence" in lower_message):
        # print("DETECTED EDIT INTENT")
        return "edit_sequence", "I'll edit the sequence as requested."
    

    elif "sequence" in lower_message and not ("edit" in lower_message):
        print("DETECTED GENERATION INTENT")
        return "generate_sequence", "Generating a sequence as requested."
    
    messages = [
        {"role": "system", "content": """You are an AI recruiter assistant. Your job is to:
    1. help users create recruiting sequences through conversation
    2. understand when they've provided enough context to generate a sequence
    3. help refine sequences based on feedback
    IMPORTANT: only suggest generating a sequence when you have:
    - clear understanding of the target audience
    - specific value proposition or offering
    - any unique context or timing considerations
     until then, ask clarifying questions to gather necessary information.
    analyze the conversation and decide if:
    - the user is just chatting/asking questions (action: "chat")
    - you have enough context to generate a sequence (action: "generate_sequence")
    - the user wants to modify an existing sequence (action: "edit_sequence")
    reply with json: {"action": chosen_action, "reply": "your natural reply"}
    for general confirmations like 'yes', 'sounds good', etc., ask for specific details about their campaign if you don't have enough context."""}
    ]
    
    if conversation_context:
        messages.extend(conversation_context)
    messages.append({"role": "user", "content": message})
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-0125",
        messages=messages,
        temperature=0.2
    )
    content = response['choices'][0]['message']['content']
    try:
        parsed = json.loads(content)
        action = parsed.get('action', 'chat')
        reply = parsed.get('reply', 'Hello!')
    except:
        action = 'chat'
        reply = content

    return action, reply

def generate_sequence(message, conversation_context=None):
    messages = [
        {"role": "system", "content": """you are an expert AI recruiter. create a sequence with exactly 3 steps.
         each step should be short, personal, and drive action.
        format each step as 'Step 1:', 'Step 2:', 'Step 3:' followed by the content.
        use the entire conversation context to understand the campaign goals and create a relevant sequence."""}
    ]
    
    if conversation_context:
        messages.extend(conversation_context)
    
    messages.append({"role": "user", "content": f"Based on our discussion, please create a 3-step sequence that would work well for this campaign."})

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-0125",
        messages=messages,
        max_tokens=600,
        temperature=0.7
    )

    return response['choices'][0]['message']['content']

def edit_sequence(existing_sequence, edit_instruction, conversation_context=None):
    messages = [
        {"role": "system", "content": """you are an expert at editing recruiter sequences.
    your job is to MODIFY the sequence based on the user's instruction and conversation context.
   keep the step format consistent with 'Step X:' labels.
   only edit what is asked, keep rest as is."""}
    ]
    
    if conversation_context:
        messages.extend(conversation_context)
    
    messages.append({"role": "user", "content": f"""
            Current sequence:
            {existing_sequence}

            Edit request:
            {edit_instruction}

            Please provide the complete updated sequence."""})

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-0125",
        messages=messages,
        temperature=0.7,
        max_tokens=800
    )

    return response['choices'][0]['message']['content']

def generate_title_from_context(context, conversation_context=None):
    messages = [
        {"role": "system", "content": "You are an expert at writing short and attractive titles for outreach campaigns."}
    ]
    
    if conversation_context:
        messages.extend(conversation_context)
    
    messages.append({"role": "user", "content": "Based on our discussion, suggest a very short campaign title."})

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-0125",
        messages=messages,
        temperature=0.5,
        max_tokens=20
    )

    content = response['choices'][0]['message']['content']
    return content.strip()
