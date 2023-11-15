import whisper

def transcribe_audio(audio_file_path):
    """
    Transcribes the given audio file using OpenAI's Whisper model.

    :param audio_file_path: Path to the audio file to be transcribed.
    :return: Transcribed text as a string.
    """

    # Load the Whisper model
    # You can choose different model sizes (e.g., 'tiny', 'base', 'small', 'medium', 'large')
    # Depending on your requirements and resource availability
    model = whisper.load_model("base")

    # Transcribe the audio
    result = model.transcribe(audio_file_path)

    # Return the transcription text
    print(result["text"])
    return result['text']

# You can add additional helper functions or classes if needed
