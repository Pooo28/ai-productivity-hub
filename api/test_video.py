from youtube_transcript_api import YouTubeTranscriptApi
import sys

video_id = '36zducUX16w'
print(f"Checking transcripts for video ID: {video_id}")

try:
    transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
    print("\nAvailable transcripts:")
    for transcript in transcript_list:
        print(f" - {transcript.language} ({transcript.language_code}) [Generated: {transcript.is_generated}]")
    
    # Try fetching one
    print("\nAttempting to fetch manual or generated English transcript...")
    try:
        t = transcript_list.find_transcript(['en'])
        print("Success! First 100 chars:", t.fetch()[0]['text'][:100])
    except:
        print("English not found, fetching first available...")
        t = next(iter(transcript_list))
        print(f"Fetched {t.language}:", t.fetch()[0]['text'][:100])

except Exception as e:
    print(f"\nError: {str(e)}")
