from pathlib import Path
from openai import OpenAI


# Initialize the OpenAI client
client = OpenAI(api_key='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')

def text_to_speech(text):
    # Define the path for the output audio file
    speech_file_path = Path(__file__).parent.parent / "audio_storage" / "translated_text_to_speech.wav"

    # Create speech from text
    response = client.audio.speech.create(
        model="tts-1",
        voice="alloy",
        input=text  # Use the provided text parameter
    )

    # Stream the response to a file
    response.stream_to_file(speech_file_path)

    # Return the path of the saved audio file
    return speech_file_path

# Example usage
#path_to_audio = text_to_speech("Today is a wonderful day to build something people love!")
#print(f"Audio file saved to: {path_to_audio}")