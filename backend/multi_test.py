from youtube_transcript_api import YouTubeTranscriptApi
import sys

def test_video(video_id):
    print(f"Testing video ID: {video_id}")
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        print("Successfully listed transcripts.")
        for t in transcript_list:
            print(f" - {t.language} ({t.language_code})")
            # Try to fetch one
            data = t.fetch()
            print(f"   Fetched {len(data)} segments.")
            break # Just one is enough
    except Exception as e:
        print(f"Error for {video_id}: {str(e)}")

if __name__ == "__main__":
    test_video('dQw4w9WgXcQ') # Never Gonna Give You Up
    print("-" * 20)
    test_video('36zducUX16w') # The original failing one
