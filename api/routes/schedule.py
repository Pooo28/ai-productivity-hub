from flask import Blueprint, request, jsonify
from openai import OpenAI
import os

schedule_bp = Blueprint('schedule', __name__)

@schedule_bp.route('/schedule-suggest', methods=['POST'])
@schedule_bp.route('/api/schedule-suggest', methods=['POST'])
def schedule_suggest():
    data = request.json
    tasks = data.get('tasks', [])

    if not tasks:
        return jsonify({"error": "No tasks provided"}), 400

    try:
        # Prepare tasks context
        task_list = "\n".join([f"- {task.get('title')} (Deadline: {task.get('deadline', 'N/A')})" for task in tasks])

        # Initialize OpenRouter client
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY"),
        )

        response = client.chat.completions.create(
            model="google/gemini-2.0-flash-lite-preview-02-05:free",
            messages=[
                {
                    "role": "system",
                    "content": "You are a productivity expert. Analyze the user's task list and suggest the most efficient order to complete them. Group similar tasks, prioritize urgent deadlines, and provide a brief 'Reasoning' for the suggested order. Use markdown."
                },
                {
                    "role": "user",
                    "content": f"My Tasks Today:\n{task_list}"
                }
            ]
        )

        suggestion = response.choices[0].message.content
        return jsonify({"suggestion": suggestion}), 200

    except Exception as e:
        print(f"Error in schedule suggestion: {str(e)}")
        return jsonify({"error": str(e)}), 500
