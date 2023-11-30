import openai

def detect_language(text):
    """
    Detects the language of the given text using ChatGPT.
    :param text: The text for which to detect the language.
    :return: The detected language.
    """

    client = openai.OpenAI(api_key='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')
    prompt = f"Determine the language of this text: {text}. Please only return the type of language no other words."
    try:
        response = client.chat.completions.create(
            model="gpt-4-1106-preview",  # Adjust the engine as needed
            messages=[
                {"role": "system", "content": "You are a language detection assistant."},
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
    prompt = f"Translate the following text to {target_language}: {text}. No more other words or prompts other than the language translation."
    try:
        response = client.chat.completions.create(
            model="gpt-4-1106-preview",
            # Constructing the messages for a chat-based interaction
            messages = [
                {"role": "system", "content": "You are a translation assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=128  # Adjust as necessary
        )
        latest_response = response.choices[0].message.content
        return latest_response.strip()
    except Exception as e:
        print(f"An error occurred: {e}")
        return None


# Add additional functions as necessary
