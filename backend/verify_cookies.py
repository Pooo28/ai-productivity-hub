import os
from youtube_transcript_api import YouTubeTranscriptApi
import sys

def verify_cookie_logic():
    video_id = 'dQw4w9WgXcQ'
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    cookies_path = os.path.join(backend_dir, 'cookies.txt')
    
    print(f"Checking for cookies at: {cookies_path}")
    
    cookies_arg = {}
    if os.path.exists(cookies_path):
        print("Found cookies.txt! Testing with cookies...")
        cookies_arg = {'cookies': cookies_path}
    else:
        print("cookies.txt not found. Testing anonymous request (likely to fail)...")
    
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id, **cookies_arg)
        print("Successfully listed transcripts!")
        return True
    except Exception as e:
        error_str = str(e).lower()
        if "no element found" in error_str:
            print("Confirmed: YouTube is still blocking anonymous requests.")
            print("Action item: User needs to provide cookies.txt")
        else:
            print(f"Unexpected error: {str(e)}")
        return False

if __name__ == "__main__":
    verify_cookie_logic()
