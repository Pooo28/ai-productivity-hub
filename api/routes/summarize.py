from flask import Blueprint, request, jsonify
from openai import OpenAI
import os

summarize_bp = Blueprint('summarize', __name__)

def handle_summarize():
    data = request.json
    content = data.get('content')
    title = data.get('title', 'Untitled')

    if not content:
        return jsonify({"error": "Content is required"}), 400

    try:
        import time
        start_time = time.time()
        
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            return jsonify({"error": "OPENROUTER_API_KEY is missing in backend environment variables"}), 500

        # Aggressive truncation for speed (approx 6k chars / 1.5k tokens)
        if len(content) > 6000:
            content = content[:6000] + "... [Truncated for speed]"

        # Initialize OpenRouter client
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )

        # Using a stable free model alias
        # Using Meta Llama 3.3 for extreme speed and accuracy via OpenRouter
        response = client.chat.completions.create(
            model="meta-llama/llama-3.3-70b-instruct", 
            messages=[
                {
                    "role": "system",
                    "content": "You are a highly efficient productivity assistant. Summarize the following notes with clear bullet points, bold key terms, and a brief concluding takeaway."
                },
                {
                    "role": "user",
                    "content": f"Title: {title}\n\nNotes:\n{content}"
                }
            ]
        )

        summary = response.choices[0].message.content
        duration = time.time() - start_time
        print(f"DEBUG: Summarization took {duration:.2f} seconds")
        
        return jsonify({"summary": summary}), 200

    except Exception as e:
        print(f"Error in summarization: {str(e)}")
        return jsonify({"error": str(e)}), 500
