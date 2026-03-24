import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS

# Ensure the api directory itself is in the path
api_dir = os.path.dirname(os.path.abspath(__file__))
if api_dir not in sys.path:
    sys.path.append(api_dir)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# We'll import blueprints carefully
try:
    from routes.summarize import summarize_bp
    from routes.youtube import youtube_bp
    from routes.jobs import jobs_bp
    from routes.schedule import schedule_bp
    
    app.register_blueprint(summarize_bp)
    app.register_blueprint(youtube_bp)
    app.register_blueprint(jobs_bp)
    app.register_blueprint(schedule_bp)
    import_error = None
except Exception as e:
    import_error = str(e)

@app.route('/api/health', methods=['GET'])
def health_check():
    if import_error:
        return jsonify({
            "status": "error",
            "message": "Initialization failed",
            "error": import_error
        }), 500
    
    return jsonify({
        "status": "ok", 
        "message": "Flask backend is fully operational",
        "env_check": {
            "OPENROUTER": bool(os.getenv("OPENROUTER_API_KEY")),
            "FIRECRAWL": bool(os.getenv("FIRECRAWL_API_KEY"))
        }
    }), 200

# For local development
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
