import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Ensure the api directory itself is in the path so we can import 'routes'
api_dir = os.path.dirname(os.path.abspath(__file__))
if api_dir not in sys.path:
    sys.path.append(api_dir)

# Load .env from the project root (parent of api/)
root_dir = os.path.dirname(api_dir)
env_path = os.path.join(root_dir, '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
load_dotenv()

# We'll import blueprints inside a try-except to catch startup errors
try:
    from routes.summarize import summarize_bp
    from routes.youtube import youtube_bp
    from routes.jobs import jobs_bp
    from routes.schedule import schedule_bp
    import_error = None
except Exception as e:
    import_error = str(e)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

if not import_error:
    app.register_blueprint(summarize_bp)
    app.register_blueprint(youtube_bp)
    app.register_blueprint(jobs_bp)
    app.register_blueprint(schedule_bp)

@app.route('/api/health', methods=['GET'])
def health_check():
    if import_error:
        return jsonify({
            "status": "error", 
            "message": "Backend failed to initialize", 
            "error": import_error,
            "path": sys.path,
            "api_dir": api_dir
        }), 500
    return jsonify({
        "status": "ok", 
        "message": "Flask backend is running",
        "env_check": {
            "OPENROUTER": bool(os.getenv("OPENROUTER_API_KEY")),
            "FIRECRAWL": bool(os.getenv("FIRECRAWL_API_KEY"))
        }
    }), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
