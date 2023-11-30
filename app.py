from flask import Flask, request, Response, jsonify, render_template, send_from_directory
from utils.whisper_api import transcribe_audio
from utils.chatgpt_api import detect_language, translate_text
from utils.tts_api import text_to_speech
import os

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



'''
@app.route('/tts', methods=['POST'])
def tts():
    text = request.json['text']
    language = request.json['language'] # Optional, based on your TTS API
    speech_audio = text_to_speech(text, language)
    return jsonify({'speech_audio': speech_audio}) # You might return a URL to the audio file

@app.route('/describe_image', methods=['POST'])
def describe():
    # Assuming image file is sent in the request
    image_file = request.files['image']
    description = describe_image(image_file)
    return jsonify({'description': description})
'''
if __name__ == '__main__':
    app.run(debug=True)

