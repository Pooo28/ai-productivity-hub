import time
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

models_to_test = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-2-9b-it:free",
    "deepseek/deepseek-chat:free",
    "microsoft/phi-3-mini-128k-instruct:free",
]

for model in models_to_test:
    print(f"\nTesting {model}...")
    start = time.time()
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional career consultant. Return exactly \{\"status\": \"ok\"\}."
                },
                {
                    "role": "user",
                    "content": f"Return JSON."
                }
            ],
            response_format={ "type": "json_object" }
        )
        time_taken = time.time() - start
        print(f"Time taken: {time_taken:.2f} seconds")
    except Exception as e:
        print(f"Failed: {e}")
