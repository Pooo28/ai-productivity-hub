import os
import requests
from youtube_transcript_api import YouTubeTranscriptApi
from http.cookiejar import MozillaCookieJar

def test_manual_session(video_id):
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    cookies_path = os.path.join(backend_dir, 'cookies.txt')
    
    session = requests.Session()
    session.headers.update({"Accept-Language": "en-US"})
    
    if os.path.exists(cookies_path):
        print(f"Loading cookies from {cookies_path}")
        cj = MozillaCookieJar(cookies_path)
        cj.load(ignore_discard=True, ignore_expires=True)
        session.cookies = cj
    else:
        print("No cookies found!")

    try:
        # Instantiate the API with our session
        api = YouTubeTranscriptApi(http_client=session)
        
        # Use the instance method 'list'
        transcript_list = api.list(video_id)
        print("Successfully listed transcripts!")
        
        transcript = transcript_list.find_transcript(['en'])
        data = transcript.fetch()
        print(f"Successfully fetched {len(data)} fragments!")
        return True
    except Exception as e:
        print(f"Failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_manual_session('dQw4w9WgXcQ')
