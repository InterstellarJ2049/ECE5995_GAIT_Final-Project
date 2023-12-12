from flask import Flask, request, Response, jsonify, render_template
from utils.whisper_api import transcribe_audio # TODO: comment out temporarily
from utils.chatgpt_api import detect_language, translate_text, process_image_data, process_image_communication, is_image_related, process_general_text
from utils.tts_api import text_to_speech
import os
import base64

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

# <TODO: comment out temporarily start>
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
# <TODO: comment out temporarily end>

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

# Process direct [Capture] and [Upload] image without user input
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

    # if response.status_code != 200: # cause error: AttributeError: 'str' object has no attribute 'status_code'
    #     return jsonify({'error': 'Failed to process the image.'}), 500
    
    print("output:", response.content) # debug, get expected output
    global image_context
    image_context['description'] = response.content # image_description  # Store the image description
    return response.content

# Process image with user input
@app.route('/process_image_chat', methods=['POST'])
def process_image_chat():
    if 'file' in request.files:
        file = request.files['file']
        base64_image = base64.b64encode(file.read()).decode('utf-8')
        data = request.json
        user_message = data.get('message')
        # response = process_image_communication(base64_image, user_message)
        # Check if the user message is related to the image
        if is_image_related(user_message) and base64_image:
            # The message is related to the image, so we process it accordingly
            response = process_image_communication(base64_image, user_message)
        else:
            # The message is not related to the image, or there is no image provided
            # So we process it as a general text message
            response = process_general_text(user_message)

    else:
        data = request.json
        user_message = data.get('message')
        base64_image = data.get('image', '')
        # if not base64_image: # Couse error: user input text only failed
        #     return jsonify({'error': 'No image data received.'}), 400        
        if is_image_related(user_message) and base64_image:
            # The message is related to the image, so we process it accordingly
            response = process_image_communication(base64_image, user_message)
        else:
            # The message is not related to the image, or there is no image provided
            # So we process it as a general text message
            response = process_general_text(user_message)
        
    print("output_chat:", response, "\n") # response.content, debug, get expected output
    print("user_message:", user_message, "\n")
    
    global image_context
    image_context['description'] = response # image_description  # Store the image description
    
    return jsonify({'response': response})
    

if __name__ == '__main__':
    app.run(debug=True)

