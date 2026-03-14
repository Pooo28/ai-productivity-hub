from youtube_transcript_api import YouTubeTranscriptApi
import inspect

print("Inspection of YouTubeTranscriptApi.list:")
try:
    sig = inspect.signature(YouTubeTranscriptApi.list)
    print(f"Signature: {sig}")
except Exception as e:
    print(f"Could not get signature of list: {e}")

print("\nInspection of YouTubeTranscriptApi.fetch:")
try:
    sig = inspect.signature(YouTubeTranscriptApi.fetch)
    print(f"Signature: {sig}")
except Exception as e:
    print(f"Could not get signature of fetch: {e}")

# Trying to see if they are class methods or instance methods
print(f"\nType of list: {type(YouTubeTranscriptApi.list)}")
