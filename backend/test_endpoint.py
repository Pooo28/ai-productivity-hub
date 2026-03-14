import requests
import json

url = "http://localhost:5000/api/youtube-summary"
payload = {"url": "https://youtu.be/36zducUX16w?si=cyH2tImY9ZQioZC1"}
headers = {"Content-Type": "application/json"}

print(f"Testing local API endpoint: {url}")
print(f"Payload: {payload}")

try:
    response = requests.post(url, data=json.dumps(payload), headers=headers)
    print(f"Status Code: {response.status_code}")
    print("Response Body:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error testing endpoint: {str(e)}")
