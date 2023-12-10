import os
import base64
import requests
from flask import Flask, request, jsonify
from utils.chatgpt_api import detect_language, translate_text, process_image_data, generate_answer_based_on_context #, generate_image_description

app = Flask(__name__, static_folder='src', static_url_path='/')

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

    if response.status_code != 200:
        return jsonify({'error': 'Failed to process the image.'}), 500
    
    print(response.content) # debug, get expected output
    # return response.content
    # Instead of directly returning the description, store it in the context
    global image_context
    image_context['description'] = response.content # image_description  # Store the image description
    return response.content
    # return jsonify({'message': "What do you want to know regarding this picture you submit?"})

@app.route('/process_user_input', methods=['POST'])
def process_user_input():
    data = request.json
    user_message = data.get('message')

    # Here, you would add the logic to process the user's message.
    # This might involve sending the message to OpenAI's API or another service,
    # or handling the logic directly if you're maintaining the context.

    # Retrieve the stored image description
    global image_context
    description = image_context.get('description', '')

    # For demonstration, let's just echo the message back
    # response = f"You asked: {user_message}"

    # Use the image description as context to generate an answer to the user's question
    answer = generate_answer_based_on_context(description, user_message)
    
    # return jsonify({'response': response})
    return jsonify({'response': answer})

if __name__ == '__main__':
    app.run(debug=True)


# TODO:
# 1. Add a loading signal for processing the user's image