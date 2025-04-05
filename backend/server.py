from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def home():
    return jsonify({"status": "Server is running"})

@app.route('/test', methods=['POST'])
def test_endpoint():
    data = request.get_json()
    print("Received data:", data)
    return jsonify({"status": "success", "received": data})

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')