from youtube_transcript_api import YouTubeTranscriptApi
import requests

video_id = "dQw4w9WgXcQ" # Rick Astley - Never Gonna Give You Up (Always has transcripts)
session = requests.Session()

print("Testing list method...")
try:
    # Testing static method
    transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
    print("Successfully called list_transcripts")
except Exception as e:
    print(f"Failed list_transcripts: {e}")

try:
    # Testing instanced approach like in the code
    api = YouTubeTranscriptApi()
    print("Successfully instantiated YouTubeTranscriptApi")
    # check if list exists on instance
    if hasattr(api, 'list'):
        print("Instance has 'list' method")
    else:
        print("Instance DOES NOT have 'list' method")
except Exception as e:
    print(f"Failed to instantiate: {e}")

try:
    # Standard way
    transcript = YouTubeTranscriptApi.get_transcript(video_id)
    print("Successfully called get_transcript (static)")
except Exception as e:
    print(f"Failed get_transcript (static): {e}")
