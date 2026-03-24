from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok", 
        "message": "Minimal Flask backend is running",
        "env": {
            "OPENROUTER": bool(os.getenv("OPENROUTER_API_KEY")),
            "FIRECRAWL": bool(os.getenv("FIRECRAWL_API_KEY"))
        }
    }), 200

# For local development
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
