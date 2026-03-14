import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "http://localhost:5000"

def test_job_search():
    print("\n--- Testing Job Search Endpoint ---")
    payload = {
        "role": "Software Engineer",
        "location": "Bangalore",
        "skills": "React, TypeScript, Python"
    }
    try:
        response = requests.post(f"{BASE_URL}/api/job-search", json=payload)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("SUCCESS: Summary:", data.get('summary'))
            print(f"Jobs found: {len(data.get('jobs', []))}")
        else:
            print(f"FAILED: {response.text}")
    except Exception as e:
        print(f"ERROR: {str(e)}")

def test_summarize():
    print("\n--- Testing Summarize Endpoint ---")
    payload = {
        "content": "This is a test document to verify the AI summarization feature is working correctly with the new dynamic router."
    }
    try:
        response = requests.post(f"{BASE_URL}/api/summarize", json=payload)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("SUCCESS:", response.json().get('summary')[:50], "...")
        else:
            print(f"FAILED: {response.text}")
    except Exception as e:
        print(f"ERROR: {str(e)}")

if __name__ == "__main__":
    # Note: Ensure the Flask server is running on port 5000
    test_job_search()
    test_summarize()
