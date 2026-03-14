from flask import Blueprint, request, jsonify
from youtube_transcript_api import YouTubeTranscriptApi
from openai import OpenAI
import os
import re
import requests
from http.cookiejar import MozillaCookieJar

youtube_bp = Blueprint('youtube', __name__)

def extract_video_id(url):
    # Regex to handle various YouTube URL formats
    pattern = r'(?:v=|\/|be\/|embed\/)([0-9A-Za-z_-]{11})'
    match = re.search(pattern, url)
    return match.group(1) if match else None

@youtube_bp.route('/api/youtube-summary', methods=['POST'])
def youtube_summary():
    data = request.json
    url = data.get('url')

    if not url:
        return jsonify({"error": "YouTube URL is required"}), 400

    video_id = extract_video_id(url)
    if not video_id:
        return jsonify({"error": "Invalid YouTube URL"}), 400

    try:
        # Path to cookies file (expected in backend/ folder)
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        cookies_path = os.path.join(backend_dir, 'cookies.txt')
        
        # Prepare session
        session = requests.Session()
        session.headers.update({"Accept-Language": "en-US"})
        
        if os.path.exists(cookies_path):
            print(f"Using cookies from {cookies_path}")
            try:
                cj = MozillaCookieJar(cookies_path)
                cj.load(ignore_discard=True, ignore_expires=True)
                session.cookies = cj
            except Exception as e:
                print(f"Failed to load cookies: {e}")

        # Fetch transcript with improved logic
        try:
            # First attempt: standard static call (works in most versions)
            try:
                transcript_data = YouTubeTranscriptApi.get_transcript(video_id, languages=['en', 'en-GB'], cookies=cookies_path if os.path.exists(cookies_path) else None)
                transcript_text = " ".join([
                    item['text'] if isinstance(item, dict) else getattr(item, 'text', '') 
                    for item in transcript_data
                ])
                print(f"Successfully fetched transcript using get_transcript for {video_id}")
            except Exception as e1:
                print(f"Standard get_transcript failed: {e1}")
                # Second attempt: manual list approach (instanced)
                try:
                    # Some versions/proxies require instanced API with session
                    api = YouTubeTranscriptApi()
                    transcript_list = api.list(video_id) # Fixed method name
                    
                    # Try manual English, then generated English, then first available
                    try:
                        transcript = transcript_list.find_manually_created_transcript(['en'])
                    except:
                        try:
                            transcript = transcript_list.find_generated_transcript(['en'])
                        except:
                            transcript = next(iter(transcript_list))
                    
                    data_list = transcript.fetch()
                    # Handle both dict and object representations
                    transcript_text = " ".join([
                        item['text'] if isinstance(item, dict) else getattr(item, 'text', '') 
                        for item in data_list
                    ])
                    print(f"Successfully fetched transcript using list for {video_id}")
                except Exception as e2:
                    print(f"Instanced list approach failed: {e2}")
                    raise Exception(f"Failed to retrieve transcript: {str(e2)}")

        except Exception as transcript_err:
            error_str = str(transcript_err).lower()
            print(f"Transcript fetch failed for {video_id}: {error_str}")
            
            if "no element found" in error_str or "could not retrieve" in error_str or "blocked" in error_str:
                msg = ("YouTube is returning an empty response for this transcript. "
                       "This usually means the request is being blocked. ")
                if not os.path.exists(cookies_path):
                    msg += "To fix this, please provide a 'cookies.txt' file in the backend folder."
                else:
                    msg += "Your 'cookies.txt' might be invalid or expired."
                
                return jsonify({"error": msg}), 500
            
            return jsonify({"error": f"YouTube Transcript Error: {str(transcript_err)}"}), 500

        # Limit transcript length for the LLM

        # Limit transcript length for the LLM (OpenRouter auto handles large context usually, but good to be safe)
        if len(transcript_text) > 15000:
            transcript_text = transcript_text[:15000] + "..."

        # Initialize OpenRouter client
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY"),
        )

        response = client.chat.completions.create(
            model="openrouter/free",
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional video content analyst. Summarize this YouTube video transcript. Provide: 1) A clear overview, 2) Key points with timestamps (if applicable from the text), and 3) Three main takeaways."
                },
                {
                    "role": "user",
                    "content": f"Transcript:\n{transcript_text}"
                }
            ]
        )

        summary = response.choices[0].message.content
        return jsonify({
            "summary": summary,
            "video_id": video_id,
            "transcript_preview": transcript_text[:500] + "..."
        }), 200

    except Exception as e:
        print(f"Error in YouTube summarization: {str(e)}")
        error_msg = str(e)
        if "No transcript found" in error_msg:
            error_msg = "This video does not have a transcript available."
        return jsonify({"error": error_msg}), 500
