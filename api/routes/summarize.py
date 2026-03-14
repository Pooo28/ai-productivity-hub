from flask import Blueprint, request, jsonify
from openai import OpenAI
import os

summarize_bp = Blueprint('summarize', __name__)

@summarize_bp.route('/api/summarize', methods=['POST'])
def summarize_notes():
    data = request.json
    content = data.get('content')
    title = data.get('title', 'Untitled')

    if not content:
        return jsonify({"error": "Content is required"}), 400

    try:
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            return jsonify({"error": "OPENROUTER_API_KEY is missing in backend environment variables"}), 500

        # Initialize OpenRouter client (OpenAI compatible)
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )

        response = client.chat.completions.create(
            model="openrouter/free", 
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
        return jsonify({"summary": summary}), 200

    except Exception as e:
        print(f"Error in summarization: {str(e)}")
        return jsonify({"error": str(e)}), 500
