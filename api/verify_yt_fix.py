import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_yt():
    url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    print(f"Testing YouTube summary for: {url}")
    try:
        resp = requests.post(f"{BASE_URL}/api/youtube-summary", json={"url": url}, timeout=30)
        print(f"Status Code: {resp.status_code}")
        data = resp.json()
        if resp.status_code == 200:
            print("Summary successfully generated!")
            print(f"Preview: {data.get('summary')[:200]}...")
        else:
            print(f"Error: {data.get('error')}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_yt()
