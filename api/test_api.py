import requests
import time
import json

print("Testing job search API endpoint...")
try:
    start_time = time.time()
    response = requests.post(
        "http://127.0.0.1:5000/api/job-search", 
        json={"role": "React", "location": "Remote"}
    )
    time_taken = time.time() - start_time
    print(f"Time taken: {time_taken:.2f} seconds")
    print(f"Status Code: {response.status_code}")
    print("Response JSON snippet:")
    data = response.json()
    print(json.dumps(data, indent=2)[:500])
except Exception as e:
    print(f"Error testing API: {e}")
