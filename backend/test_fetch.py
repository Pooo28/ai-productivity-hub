import os
from youtube_transcript_api import YouTubeTranscriptApi
import sys

def test_fetch(video_id):
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    cookies_path = os.path.join(backend_dir, 'cookies.txt')
    
    print(f"--- Testing Video: {video_id} ---")
    
    # Test 1: Anonymous
    print("\n[Test 1] Anonymous Fetch:")
    try:
        YouTubeTranscriptApi.get_transcript(video_id)
        print("SUCCESS: Anonymous fetch worked!")
    except Exception as e:
        print(f"FAILED: {str(e)[:100]}")

    # Test 2: With Cookies
    print("\n[Test 2] Cookie-based Fetch:")
    if not os.path.exists(cookies_path):
        print(f"FAILED: cookies.txt not found at {cookies_path}")
        return

    try:
        from youtube_transcript_api import YouTubeTranscriptApi
        # Match application logic
        ts_list = YouTubeTranscriptApi.list_transcripts(video_id, cookies=cookies_path)
        transcript = ts_list.find_transcript(['en'])
        data = transcript.fetch()
        print(f"SUCCESS: Fetched {len(data)} fragments using cookies!")
    except Exception as e:
        print(f"FAILED with cookies: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    vid = sys.argv[1] if len(sys.argv) > 1 else 'dQw4w9WgXcQ'
    test_fetch(vid)

if __name__ == "__main__":
    # Test with a common video if none provided
    vid = sys.argv[1] if len(sys.argv) > 1 else 'dQw4w9WgXcQ'
    test_fetch(vid)
