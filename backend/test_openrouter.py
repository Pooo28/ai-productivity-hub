import time
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

models_to_test = ["openrouter/free"]

with open("d:/Pro2/backend/test_log_json.txt", "w") as f:
    for model_id in models_to_test:
        f.write(f"\nTesting model with JSON: {model_id}...\n")
        try:
            start = time.time()
            response = client.chat.completions.create(
                model=model_id,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant. Output ONLY JSON."},
                    {"role": "user", "content": "Return a JSON object with a 'status' field set to 'OK'."}
                ],
                response_format={ "type": "json_object" }
            )
            time_taken = time.time() - start
            f.write(f"SUCCESS JSON: {model_id} responded in {time_taken:.2f}s\n")
            f.write(f"Content: {response.choices[0].message.content}\n")
        except Exception as e:
            f.write(f"FAILED JSON: {model_id} - Error: {str(e)}\n")
