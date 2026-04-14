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

@app.route('/api/routes-debug', methods=['GET'])
def list_routes():
    import urllib.parse
    output = []
    for rule in app.url_map.iter_rules():
        options = {}
        for arg in rule.arguments:
            options[arg] = "[{0}]".format(arg)
        methods = ','.join(rule.methods)
        url = urllib.parse.unquote(str(rule))
        line = "{:50s} {:20s} {}".format(rule.endpoint, methods, url)
        output.append(line)
    return "\n".join(output)

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
    @app.route('/api/api/summarize', methods=['POST'], strict_slashes=False)
    @app.route('/api/summarize', methods=['POST'], strict_slashes=False)
    @app.route('/summarize', methods=['POST'], strict_slashes=False)
    def route_summarize(): return handle_summarize()

    @app.route('/api/api/youtube-summary', methods=['POST'], strict_slashes=False)
    @app.route('/api/youtube-summary', methods=['POST'], strict_slashes=False)
    @app.route('/youtube-summary', methods=['POST'], strict_slashes=False)
    def route_youtube(): return handle_youtube_summary()

    @app.route('/api/api/job-search', methods=['POST'], strict_slashes=False)
    @app.route('/api/job-search', methods=['POST'], strict_slashes=False)
    @app.route('/job-search', methods=['POST'], strict_slashes=False)
    def route_jobs(): return handle_job_search()

    @app.route('/api/api/draft-cover-letter', methods=['POST'], strict_slashes=False)
    @app.route('/api/draft-cover-letter', methods=['POST'], strict_slashes=False)
    @app.route('/draft-cover-letter', methods=['POST'], strict_slashes=False)
    def route_cover_letter(): return handle_cover_letter_draft()

    @app.route('/api/api/schedule-suggest', methods=['POST'], strict_slashes=False)
    @app.route('/api/schedule-suggest', methods=['POST'], strict_slashes=False)
    @app.route('/schedule-suggest', methods=['POST'], strict_slashes=False)
    def route_schedule(): return handle_schedule_suggest()
            
    # Universal fallback debugger catch-all
    @app.route('/<path:dummy>', methods=['POST', 'GET', 'OPTIONS'])
    def fallback(dummy):
        return jsonify({"error": f"Route not found in Flask: {dummy}", "path": request.path}), 404

            
    import_error = None
except Exception as e:
    import_error = str(e)
    print(f"IMPORT ERROR: {e}")

# For local development
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
