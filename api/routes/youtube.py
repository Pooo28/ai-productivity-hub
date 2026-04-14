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

def handle_youtube_summary():
    data = request.json
    url = data.get('url')

    if not url:
        return jsonify({"error": "YouTube URL is required"}), 400

    video_id = extract_video_id(url)
    if not video_id:
        return jsonify({"error": "Invalid YouTube URL"}), 400

    try:
        # Multistage transcript fetching with high-reliability fallbacks
        try:
            # Stage 1: Official API (likely to fail on Vercel without cookies)
            try:
                api = YouTubeTranscriptApi()
                transcript_text = " ".join([t['text'] for t in api.get_transcript(video_id)])
                print(f"Success Stage 1 for {video_id}")
            except:
                # Stage 2: Public Proxy (Robust against Captchas)
                print(f"Stage 1 failed, triggering Stage 2 Proxy for {video_id}")
                proxy_url = f"https://youtubetranscript.com/?server_vid={video_id}"
                proxy_res = requests.get(proxy_url, timeout=12)
                if proxy_res.status_code == 200 and '<?xml' in proxy_res.text:
                    import xml.etree.ElementTree as ET
                    root = ET.fromstring(proxy_res.text)
                    transcript_text = " ".join([t.text for t in root.findall('text') if t.text])
                else:
                    raise Exception("Proxy failed")

        except Exception as transcript_err:
            print(f"Transcript fetch failed for {video_id}: {str(transcript_err)}")
            return jsonify({"error": "YouTube bot protection is active or subtitles are missing. Please try another video or try again in 5 minutes."}), 500

        # AI Processing
        from config import GROQ_API_KEY as FALLBACK_KEY
        api_key = os.getenv("GROQ_API_KEY") or FALLBACK_KEY
        
        if not api_key:
            return jsonify({"error": "GROQ_API_KEY is missing"}), 500

        client = OpenAI(
            base_url="https://api.groq.com/openai/v1",
            api_key=api_key,
        )
        # Limit transcript length for the LLM (8,000 chars is plenty for a crisp summary)
        if len(transcript_text) > 8000:
            transcript_text = transcript_text[:8000] + "..."

        import time
        ai_start_time = time.time()
        
        # Using Groq Llama 3.3 for extreme speed and accuracy via the fallback-equipped client
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
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

        ai_duration = time.time() - ai_start_time
        print(f"DEBUG: YouTube AI Processing took {ai_duration:.2f} seconds")

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
