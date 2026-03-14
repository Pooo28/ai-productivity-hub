import requests
import os

def test_raw_request(video_id):
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    cookies_path = os.path.join(backend_dir, 'cookies.txt')
    
    cookies = {}
    with open(cookies_path, 'r') as f:
        for line in f:
            if not line.startswith('#') and line.strip():
                parts = line.split('\t')
                if len(parts) >= 7:
                    cookies[parts[5]] = parts[6].strip()

    url = f"https://www.youtube.com/watch?v={video_id}"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    }
    
    print(f"Requesting: {url}")
    response = requests.get(url, cookies=cookies, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response Length: {len(response.text)}")
    
    if "ytInitialPlayerResponse" in response.text:
        print("Success: Found player response in page!")
        if '"captions":' in response.text:
            print("Success: Captions found in data!")
        else:
            print("Warning: No captions found in data.")
    else:
        print("Failure: Could not find player response. Are the cookies invalid?")
        if "Sign in" in response.text:
            print("Detected 'Sign in' prompt - cookies are likely ignored.")

if __name__ == "__main__":
    test_raw_request('dQw4w9WgXcQ')
