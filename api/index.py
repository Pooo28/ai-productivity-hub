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

@app.route('/api/health', methods=['GET'])
@app.route('/health', methods=['GET'])
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

# Import handlers from route files
try:
    from routes.summarize import handle_summarize
    from routes.youtube import handle_youtube_summary
    from routes.jobs import handle_job_search, handle_cover_letter_draft
    from routes.schedule import handle_schedule_suggest
    
    # Register routes DIRECTLY on the app object for maximum stability on Vercel
    @app.route('/api/summarize', methods=['POST'])
    @app.route('/summarize', methods=['POST'])
    def route_summarize(): return handle_summarize()

    @app.route('/api/youtube-summary', methods=['POST'])
    @app.route('/youtube-summary', methods=['POST'])
    def route_youtube(): return handle_youtube_summary()

    @app.route('/api/job-search', methods=['POST'])
    @app.route('/job-search', methods=['POST'])
    def route_jobs(): return handle_job_search()

    @app.route('/api/draft-cover-letter', methods=['POST'])
    @app.route('/draft-cover-letter', methods=['POST'])
    def route_cover_letter(): return handle_cover_letter_draft()

    @app.route('/api/schedule-suggest', methods=['POST'])
    @app.route('/schedule-suggest', methods=['POST'])
    def route_schedule(): return handle_schedule_suggest()
            
    import_error = None
except Exception as e:
    import_error = str(e)
    print(f"IMPORT ERROR: {e}")

# For local development
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
