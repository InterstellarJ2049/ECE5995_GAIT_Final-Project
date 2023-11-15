from flask import Flask, request, jsonify, render_template
from utils.whisper_api import transcribe_audio
#from utils.chatgpt_api import translate_text, describe_image
#from utils.tts_api import text_to_speech
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
    filename = os.path.join('D:/UIowa/ECE5995GAIT/FinalProject/', filename)
    audio_file.save(filename)

    transcription = transcribe_audio(filename)

    os.remove(filename)
    return jsonify({'transcription': transcription})
'''
@app.route('/translate', methods=['POST'])
def translate():
    text = request.json['text']
    target_language = request.json['target_language']
    translated_text = translate_text(text, target_language)
    return jsonify({'translated_text': translated_text})

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

