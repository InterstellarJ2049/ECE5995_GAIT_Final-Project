from flask import Flask, request, Response, jsonify, render_template
from utils.whisper_api import transcribe_audio
from utils.chatgpt_api import detect_language, translate_text, process_image_data, generate_answer_based_on_context
from utils.tts_api import text_to_speech
import os
import base64

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/transcribe', methods=['POST'])
def transcribe():
    audio_file = request.files['audio']
    filename = audio_file.filename
    if not filename.endswith('.wav'):  # Ensure it has the .wav extension
        filename += '.wav'
    filename = os.path.join('./audio_storage', filename)
    audio_file.save(filename)

    transcription = transcribe_audio(filename)

    os.remove(filename)
    return jsonify({'transcription': transcription})

@app.route('/detect_language', methods=['POST'])
def detect_language_route():
    audio_file = request.files['audio']
    filename = audio_file.filename
    if not filename.endswith('.wav'):  # Ensure it has the .wav extension
        filename += '.wav'
    filepath = os.path.join('./audio_storage', filename)
    audio_file.save(filepath)

    # Transcribe the audio to text
    transcription = transcribe_audio(filepath)

    # Clean up: remove the audio file after transcription
    os.remove(filepath)

    # Detect the language of the transcribed text
    detected_language = detect_language(transcription)
    return jsonify({'detected_language': detected_language})


@app.route('/translate', methods=['POST'])
def translate():
    data = request.json
    original_text = data.get('text')
    target_language = data.get('target_language')

    translated_text = translate_text(original_text, target_language)
    return jsonify({'translated_text': translated_text})


@app.route('/text_to_speech', methods=['POST'])
def tts():
    data = request.json
    text = data.get('text')

    filename = text_to_speech(text)  # This should return the path to the audio file
    with open(filename, 'rb') as audio_file:
        audio_data = audio_file.read()
        
    # Convert audio data to a blob
    return Response(audio_data, mimetype="audio/wav")


# The following is for webCam-GPT4V

# Store the context globally (this is simplified and not recommended for production)
# In a production environment, consider using a database or user sessions to store context
image_context = {}

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
    
    print("output:", response.content) # debug, get expected output
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

    print("description:", description, "\n")
    print("user_message:", user_message, "\n")
    print("anwer:", answer, "\n")
    
    # return jsonify({'response': response})
    return jsonify({'response': answer})

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

if __name__ == '__main__':
    app.run(debug=True)

