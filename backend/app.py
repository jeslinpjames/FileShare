from flask import Flask, request, jsonify, send_file
from flask_cors import CORS, cross_origin
import json
import random
import string
from io import BytesIO

app = Flask(__name__)

# Allow requests from frontend domain
CORS(app, resources={r"/api/*": {"origins": "https://sharemore.online"}})

# Store active transfers
active_transfers = {}

def generate_random_code(length=6):
    """Generates a random alphanumeric code."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

@app.route('/api/upload', methods=['POST'])
@cross_origin(origin='https://sharemore.online')
def upload_file():
    file = request.files.get('file')
    if file:
        file_content = BytesIO(file.read())
        code = generate_random_code()

        active_transfers[code] = {
            'file_content': file_content,
            'filename': file.filename,
            'file_size': len(file_content.getvalue())
        }

        # Save transfer info to JSON
        json_data = {'filename': file.filename, 'code': code}
        with open('transfer_info.json', 'w') as json_file:
            json.dump(json_data, json_file)

        return jsonify({'code': code, 'name': file.filename}), 200

    return jsonify({'error': 'No file provided'}), 400

@app.route('/api/download', methods=['POST'])
@cross_origin(origin='https://sharemore.online')
def download_file():
    data = request.get_json()
    code = data.get('code')

    if code in active_transfers:
        transfer_info = active_transfers.pop(code)
        file_content = transfer_info['file_content']
        filename = transfer_info['filename']

        response = send_file(
            file_content, as_attachment=True,
            download_name=filename, mimetype='application/octet-stream'
        )
        response.headers['Access-Control-Expose-Headers'] = 'Filename'
        response.headers['Filename'] = filename
        return response

    return jsonify({'error': 'Invalid code or the transfer has expired'}), 400

# Handle CORS preflight requests
@app.route('/api/upload', methods=['OPTIONS'])
@app.route('/api/download', methods=['OPTIONS'])
@cross_origin(origin='https://sharemore.online')
def handle_options():
    return '', 204

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
