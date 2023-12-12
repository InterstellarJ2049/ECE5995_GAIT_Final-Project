import os
import base64
import requests
from flask import Flask, request, jsonify, session
from flask_session import Session  # You might need to install flask-session
from utils.chatgpt_api import detect_language, translate_text, process_image_data, process_image_communication,is_image_related,process_general_text, generate_answer_based_on_context #, generate_image_description

app = Flask(__name__, static_folder='src', static_url_path='/')
app.config["SECRET_KEY"] = os.urandom(24)  # Generate a random secret key
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

# Store the context globally (this is simplified and not recommended for production)
# In a production environment, consider using a database or user sessions to store context
image_context = {}

# OpenAI API key
DEFAULT_API_KEY = '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' # Ejay's key

@app.route('/')
def index():
    """Return the index.html page."""
    return app.send_static_file('index.html')

# def process_image_data(base64_image):
#     api_key = DEFAULT_API_KEY
#     headers = {
#         "Content-Type": "application/json",
#         "Authorization": f"Bearer {api_key}"
#     }

#     payload = {
#         "model": "gpt-4-vision-preview",
#         "messages": [
#             {
#                 "role": "user",
#                 "content": [
#                     {
#                         "type": "text",
#                         "text": "What’s in this image? Be descriptive. ..."
#                     },
#                     {
#                         "type": "image_url",
#                         "image_url": {
#                             "url": f"data:image/jpeg;base64,{base64_image}"
#                         }
#                     }
#                 ]
#             }
#         ],
#         "max_tokens": 300
#     }

#     response = requests.post(
#         "https://api.openai.com/v1/chat/completions",
#         headers=headers,
#         json=payload
#     )

#     print(response) # debug, get: <Response [200]>
#     return response

@app.route('/process_image', methods=['POST'])
def process_image():
    if 'file' in request.files:
        file = request.files['file']
        base64_image = base64.b64encode(file.read()).decode('utf-8')
        response = process_image_data(base64_image)
    else:
        data = request.json
        base64_image = data.get('image', '')
        if not base64_image:
            return jsonify({'error': 'No image data received.'}), 400
        response = process_image_data(base64_image)

    # if response.status_code != 200:
    #     return jsonify({'error': 'Failed to process the image.'}), 500
    
    # if response.status_code == 200:
    #     # Assuming the response is the description text
    #     description = response.json()['choices'][0]['message']['content']
    #     # Store the description and the image in the user's session
    #     session['image_description'] = description
    #     session['base64_image'] = base64_image
    #     # return jsonify({'message': "What do you want to know about this picture?"})
    #     return response.content
    # else:
    #     return jsonify({'error': 'Failed to process the image.'}), 500
    
    print("output:", response.content) # debug, get expected output
    # return response.content
    # Instead of directly returning the description, store it in the context
    global image_context
    image_context['description'] = response.content # image_description  # Store the image description
    return response.content
    # return jsonify({'message': "What do you want to know regarding this picture you submit?"})

@app.route('/process_image_chat', methods=['POST'])
def process_image_chat():
    if 'file' in request.files:
        file = request.files['file']
        base64_image = base64.b64encode(file.read()).decode('utf-8')
        data = request.json
        user_message = data.get('message')
        # response = process_image_communication(base64_image, user_message)
        # Check if the user message is related to the image
        # if is_image_related(user_message) and base64_image:
        #     # The message is related to the image, so we process it accordingly
        #     response = process_image_communication(base64_image, user_message)
        # else:
        #     # The message is not related to the image, or there is no image provided
        #     # So we process it as a general text message
        #     response = process_general_text(user_message)
        if base64_image:
            if is_image_related(user_message) and base64_image:
                # The message is related to the image, so we process it accordingly
                response = process_image_communication(base64_image, user_message)
            else:
                # The message is not related to the image, or there is no image provided
                # So we process it as a general text message
                response = process_general_text(user_message)
        else:
            response = process_general_text(user_message)
    else:
        data = request.json
        user_message = data.get('message')
        base64_image = data.get('image', '')
        # if not base64_image:
        #     return jsonify({'error': 'No image data received.'}), 400
        # response = process_image_communication(base64_image, user_message)
        # if is_image_related(user_message) and base64_image:
        #     # The message is related to the image, so we process it accordingly
        #     response = process_image_communication(base64_image, user_message)
        # else:
        #     # The message is not related to the image, or there is no image provided
        #     # So we process it as a general text message
        #     response = process_general_text(user_message)
        if base64_image:
            if is_image_related(user_message) and base64_image:
                # The message is related to the image, so we process it accordingly
                response = process_image_communication(base64_image, user_message)
            else:
                # The message is not related to the image, or there is no image provided
                # So we process it as a general text message
                response = process_general_text(user_message)
        else:
            response = process_general_text(user_message)

    # if response.status_code != 200:
    #     return jsonify({'error': 'Failed to process the image.'}), 500
    
    # if response.status_code == 200:
    #     # Assuming the response is the description text
    #     description = response.json()['choices'][0]['message']['content']
    #     # Store the description and the image in the user's session
    #     session['image_description'] = description
    #     session['base64_image'] = base64_image
    #     # return jsonify({'message': "What do you want to know about this picture?"})
    #     return response.content
    # else:
    #     return jsonify({'error': 'Failed to process the image.'}), 500
    
    print("output_chat:", response, "\n") # response.content, debug, get expected output
    print("user_message:", user_message, "\n")
    # return response.content
    # Instead of directly returning the description, store it in the context
    global image_context
    image_context['description'] = response # image_description  # Store the image description
    # return response.content
    return jsonify({'response': response})
    # return jsonify({'message': "What do you want to know regarding this picture you submit?"})

# @app.route('/process_user_input', methods=['POST'])
# def process_user_input():
#     data = request.json
#     user_message = data.get('message')

#     # Here, you would add the logic to process the user's message.
#     # This might involve sending the message to OpenAI's API or another service,
#     # or handling the logic directly if you're maintaining the context.

#     # # Retrieve the stored image description
#     # global image_context
#     # description = image_context.get('description', '')

#     # Retrieve the stored image description and image from the user's session
#     description = session.get('image_description', '')
#     base64_image = session.get('base64_image', '')

#     # For demonstration, let's just echo the message back
#     # response = f"You asked: {user_message}"

#     # file = request.files['file']
#     # base64_image = base64.b64encode(file.read()).decode('utf-8')

#     # Use the image description as context to generate an answer to the user's question
#     # Use the stored description and image as context to generate an answer
#     answer = generate_answer_based_on_context(base64_image, description, user_message)

#     print("description:", description, "\n")
#     print("user_message:", user_message, "\n")
#     print("anwer:", answer, "\n")
    
#     # return jsonify({'response': response})
#     return jsonify({'response': answer})

if __name__ == '__main__':
    app.run(debug=True)


# TODO:
# 1. Add a loading signal for processing the user's image