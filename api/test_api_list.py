from youtube_transcript_api import YouTubeTranscriptApi

video_id = "dQw4w9WgXcQ"
api = YouTubeTranscriptApi()
print(f"API Instance methods: {[m for m in dir(api) if not m.startswith('_')]}")

try:
    print(f"Calling api.list('{video_id}')...")
    transcripts = api.list(video_id)
    print(f"Result type: {type(transcripts)}")
    
    # Try to find a transcript
    try:
        t = transcripts.find_transcript(['en'])
        print("Found English transcript")
        data = t.fetch()
        print(f"Fetch successful! First segment: {data[0]}")
    except Exception as te:
        print(f"Transcript finding/fetching failed: {te}")
        # Let's see what's in transcripts
        print(f"Transcripts object attributes: {[m for m in dir(transcripts) if not m.startswith('_')]}")

except Exception as e:
    print(f"api.list failed: {e}")
