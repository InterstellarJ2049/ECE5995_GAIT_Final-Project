from utils.chatgpt_api import encode_image
import requests

# # Example usage of the function
# image_path = 'data/image/Seminar_Nov16.jpg'  # Replace with the path to your image
# prompt = "Describe the image."  # Replace with your prompt
# response = analyze_image(image_path, prompt)
# print(response)

# OpenAI API Key
api_key = "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"

# Path to your image
image_path = "data/image/Seminar_Nov16.jpg"

# Getting the base64 string
base64_image = encode_image(image_path)

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
          "text": "What’s in this image?"
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

response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)

print(response.json())