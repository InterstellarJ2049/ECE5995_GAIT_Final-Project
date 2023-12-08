import openai
import base64
import requests

# OpenAI API key
DEFAULT_API_KEY = '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'

def detect_language(text):
    """
    Detects the language of the given text using ChatGPT.
    :param text: The text for which to detect the language.
    :return: The detected language.
    """

    client = openai.OpenAI(api_key='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')
    prompt = f"Determine the language of this text: {text}."
    try:
        response = client.chat.completions.create(
            model="gpt-4-1106-preview",  # Adjust the engine as needed
            messages=[
                {"role": "system", "content": "You are a language detection assistant. You will receive the user's request to determine the language of some text. Please only return the type of language with no other words."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=24  # Adjust as necessary
        )
        latest_response = response.choices[0].message.content
        return latest_response.strip()
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

def translate_text(text, target_language):
    """
    Translates the given text to the target language using ChatGPT.
    :param text: The text to be translated.
    :param target_language: The language to translate the text into.
    :return: Translated text.
    """
    client = openai.OpenAI(api_key='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')
    prompt = f"Translate the following text to {target_language}: {text}."
    try:
        response = client.chat.completions.create(
            model="gpt-4-1106-preview",
            # Constructing the messages for a chat-based interaction
            messages = [
                {"role": "system", "content": "You are a translation assistant. You will receive the user's request to translate some text to a targeted type of language. Please don't respond any more words or prompts other than the language translation. Thank you!"},
                {"role": "user", "content": prompt}
            ],
            max_tokens=128  # Adjust as necessary
        )
        latest_response = response.choices[0].message.content
        return latest_response.strip()
    except Exception as e:
        print(f"An error occurred: {e}")
        return None
    
def process_image_data(base64_image):
    api_key = DEFAULT_API_KEY
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    payload = {
        "model": "gpt-4-vision-preview",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "What’s in this image? Be descriptive. ..."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 300
    }

    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers=headers,
        json=payload
    )

    print(response) # debug, get: <Response [200]>
    return response


# Add additional functions as necessary
