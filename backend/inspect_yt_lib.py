import youtube_transcript_api
from youtube_transcript_api import YouTubeTranscriptApi
import inspect

print(f"Library file: {youtube_transcript_api.__file__}")
print("\nAttributes of youtube_transcript_api module:")
print(dir(youtube_transcript_api))

print("\nAttributes of YouTubeTranscriptApi class:")
print(dir(YouTubeTranscriptApi))

print("\nIs YouTubeTranscriptApi a class or something else?")
print(type(YouTubeTranscriptApi))

# Check for common methods
methods = ['get_transcript', 'list_transcripts', 'list', 'fetch']
for m in methods:
    print(f"Has '{m}': {hasattr(YouTubeTranscriptApi, m)}")
