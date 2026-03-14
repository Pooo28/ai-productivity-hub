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
        # Fetch transcript using youtube-transcript-api (latest versions don't use cookies properly anymore)
        try:
            try:
                # New instanced API in v0.6.3+
                api = YouTubeTranscriptApi()
                transcript_list = api.list(video_id)
                
                try:
                    transcript = transcript_list.find_manually_created_transcript(['en'])
                except:
                    try:
                        transcript = transcript_list.find_generated_transcript(['en'])
                    except:
                        transcript = next(iter(transcript_list))
                
                data_list = transcript.fetch()
                transcript_text = " ".join([
                    item['text'] if isinstance(item, dict) else getattr(item, 'text', '') 
                    for item in data_list
                ])
                print(f"Successfully fetched transcript using v0.6.3+ API for {video_id}")
            except Exception as e:
                print(f"Fallback to proxy due to local API failure: {str(e)}")
                proxy_url = f"https://youtubetranscript.com/?server_vid={video_id}"
                proxy_res = requests.get(proxy_url, timeout=15)
                
                if proxy_res.status_code == 200 and '<?xml' in proxy_res.text:
                    import xml.etree.ElementTree as ET
                    root = ET.fromstring(proxy_res.text)
                    transcript_text = " ".join([t.text for t in root.findall('text') if t.text])
                    if not transcript_text:
                        raise Exception("Empty transcript from proxy")
                    print(f"Successfully fetched transcript using proxy for {video_id}")
                else:
                    raise Exception("Proxy returned invalid or empty response")

        except Exception as transcript_err:
            print(f"Transcript fetch completely failed for {video_id}: {str(transcript_err)}")
            return jsonify({"error": "Failed to retrieve transcript. The video might be private, have no subtitles, or YouTube bot protection is active."}), 500

        # Limit transcript length for the LLM

        # Limit transcript length for the LLM (8,000 chars is plenty for a crisp summary)
        if len(transcript_text) > 8000:
            transcript_text = transcript_text[:8000] + "..."

        # Initialize OpenRouter client
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            return jsonify({"error": "OPENROUTER_API_KEY is missing in backend environment variables"}), 500

        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
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
