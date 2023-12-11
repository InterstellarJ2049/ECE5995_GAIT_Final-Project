import openai
import base64
import requests

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

def process_image_data(base64_image):
    api_key = "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"
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


def generate_answer_based_on_context(description, user_message):
    """
    Communication with images.
    """
    client = openai.OpenAI(api_key='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')
    prompt = f"{description}\n\nUser: {user_message}\nAI:" # f"Question: {user_message}."
    try:
        response = client.chat.completions.create(
            model="gpt-4-1106-preview",
            # Constructing the messages for a chat-based interaction
            messages = [
                {"role": "system", "content": "You are a helpful assistant. You would help the users, answering the users' questions about the images they submit.. Thank you!"},
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

# def generate_image_description(image_data):
#     # This function should take the image data as input and return a description.
#     # For example, you might use an image processing API or model to analyze the image.
#     # This is a placeholder for whatever image analysis mechanism you're using.

#     """
#     Communication with images.
#     """
#     client = openai.OpenAI(api_key='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')
#     prompt = "Generate a detailed description of the following image:"  # You may need to adjust this prompt
#     try:
#         response = client.chat.completions.create(
#             model="gpt-4-1106-preview",
#             # Constructing the messages for a chat-based interaction
#             messages = [
#                 {"role": "system", "content": "You are a helpful assistant. You would help the users, answering the users' questions about the images they submit.. Thank you!"},
#                 {"role": "user", "content": prompt}
#             ],
#             temperature=1,
#             max_tokens=256, # Adjust as necessary
#             top_p=1,
#             frequency_penalty=0,
#             presence_penalty=0
#         )
#         latest_response = response.choices[0].message.content
#         return latest_response.strip()
#     except Exception as e:
#         print(f"An error occurred: {e}")
#         return None

    # # If you're using OpenAI's API to generate a description from an image, it could look something like this:
    # openai.api_key = os.getenv("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")

    # response = openai.Completion.create(
    #     model="text-davinci-003",  # Replace with the appropriate model for your OpenAI plan
    #     prompt="Generate a detailed description of the following image:",  # You may need to adjust this prompt
    #     attachments=[{"data": image_data, "type": "image"}],  # This is a simplified example
    #     max_tokens=150
    # )
    
    # # Extract the text of the response
    # description = response.choices[0].text.strip()

    # return description

# def generate_answer_based_on_context(description, user_message):
#     # Assuming you have an OpenAI API key and have set it in your environment
#     openai.api_key = os.getenv("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") # Replace "OPENAI_API_KEY" with your API key

#     # Combine the description and the user's message to form the prompt
#     prompt = f"{description}\n\nUser: {user_message}\nAI:"

# Add additional functions as necessary
