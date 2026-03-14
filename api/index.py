from flask import Flask, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from routes.summarize import summarize_bp
from routes.youtube import youtube_bp
from routes.jobs import jobs_bp
from routes.schedule import schedule_bp

# Load .env from the project root (parent of api/)
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(root_dir, '.env'))
# Also load from current directory just in case
load_dotenv()

app = Flask(__name__)
# Vercel needs the 'app' variable to be available at the module level
app = app
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.register_blueprint(summarize_bp)
app.register_blueprint(youtube_bp)
app.register_blueprint(jobs_bp)
app.register_blueprint(schedule_bp)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Flask backend is running"}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
