import youtube_transcript_api
from youtube_transcript_api import YouTubeTranscriptApi
import sys
import subprocess

with open('debug_yt.log', 'w') as f:
    f.write(f"Python version: {sys.version}\n")
    f.write(f"Library module location: {getattr(youtube_transcript_api, '__file__', 'None')}\n")
    f.write(f"Class attributes:\n")
    for attr in dir(YouTubeTranscriptApi):
        f.write(f"  - {attr}\n")

    try:
        f.write("\nChecking pip list for youtube-transcript-api...\n")
        result = subprocess.run([sys.executable, "-m", "pip", "show", "youtube-transcript-api"], capture_output=True, text=True)
        f.write(result.stdout)
    except Exception as e:
        f.write(f"Error checking pip: {e}\n")

    if hasattr(YouTubeTranscriptApi, 'get_transcript'):
        f.write("\nget_transcript exists\n")
    else:
        f.write("\nget_transcript DOES NOT exist\n")
