import openai
import base64
import requests

# OpenAI API key
DEFAULT_API_KEY = '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' # Ejay's key

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


# The following functions are for the webCam-GPT4V
# Process direct [Capture] and [Upload] image without user input
def process_image_data(base64_image):
    api_key = DEFAULT_API_KEY # "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"
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
                        "text": "What’s in this image? Be descriptive. For each significant item recognized, wrap this word in <b> tags. Example: The image shows a <b>man</b> in front of a neutral-colored <b>wall</b>. He has short hair, wears <b>glasses</b>, and is donning a pair of over-ear <b>headphones</b>. ... Also output an itemized list of objects recognized, wrapped in <br> and <b> tags with label <br><b>Objects:."
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

# Define a function to check if the user's message is related to the image
def is_image_related(user_message):
    # This is a simple example using keyword checking
    keywords = ['image', 'picture', 'photo', 'what is this', 'explain this']
    return any(keyword in user_message.lower() for keyword in keywords)

# Process image with user input:
def process_image_communication(base64_image, user_message):
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
                        "text": user_message # "What’s in this image? Be descriptive. For each significant item recognized, wrap this word in <b> tags. Example: The image shows a <b>man</b> in front of a neutral-colored <b>wall</b>. He has short hair, wears <b>glasses</b>, and is donning a pair of over-ear <b>headphones</b>. ... Also output an itemized list of objects recognized, wrapped in <br> and <b> tags with label <br><b>Objects:."
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

    response = requests.post("https://api.openai.com/v1/chat/completions",
                                 headers=headers, json=payload).json()

    return response['choices'][0]['message']['content']

# Process general text message:
def process_general_text(user_message):
    """
    Logic to handle general text that doesn't relate to the image
    """
    client = openai.OpenAI(api_key='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')
    prompt = f"User: {user_message}\n" # f"Question: {user_message}."
    try:
        response = client.chat.completions.create(
            model="gpt-4-vision-preview", # Adjust the engine as needed: gpt-4-vision-preview, gpt-4-1106-preview
            # Constructing the messages for a chat-based interaction
            messages = [
                {"role": "system", "content": "You are a helpful assistant. You would help the users, answering the users' general questions that doesn't relate to the image. Thank you!"},
                {"role": "user", "content": prompt}
            ],
            temperature=1,
            max_tokens=256, # Adjust as necessary
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
        )
        latest_response = response.choices[0].message.content
        return latest_response.strip()
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

# Add additional functions as necessary
