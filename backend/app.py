from flask import Flask, request, jsonify, send_file
from flask_cors import CORS, cross_origin
import json
import random
import string
from io import BytesIO

app = Flask(__name__)

# Allow only requests from https://sharemore.online
CORS(app, resources={r"/*": {"origins": "https://sharemore.online"}})

# Initialize a dictionary to hold active transfers
active_transfers = {}

def generate_random_code(length=6):
    """Generates a random alphanumeric code."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

@app.route('/upload', methods=['POST'])
@cross_origin(origin='https://sharemore.online')  # CORS for upload
def upload_file():
    file = request.files.get('file')
    if file:
        file_content = BytesIO(file.read())
        file_content.seek(0)
        code = generate_random_code()

        # Store file content in the active transfers
        active_transfers[code] = {
            'file_content': file_content,
            'filename': file.filename,
            'file_size': len(file_content.getvalue())
        }

        # Update the transfer_info.json file
        json_data = {
            'filename': file.filename,
            'code': code
        }
        with open('transfer_info.json', 'w') as json_file:
            json.dump(json_data, json_file)

        return jsonify({'code': code, 'name': file.filename}), 200

    return jsonify({'error': 'No file provided'}), 400

@app.route('/download', methods=['POST'])
@cross_origin(origin='https://sharemore.online')  # CORS for download
def download_file():
    data = request.get_json()
    code = data.get('code')

    # Check if the active transfers dictionary contains the code
    if code in active_transfers:
        transfer_info = active_transfers.pop(code)  # Remove the transfer info
        file_content = transfer_info['file_content']
        filename = transfer_info['filename']

        # Use send_file to send the file
        response = send_file(
            file_content,
            as_attachment=True,
            download_name=filename,
            mimetype='application/octet-stream'
        )
        response.headers['Access-Control-Expose-Headers'] = 'Filename'
        response.headers['Filename'] = filename  # Optionally expose the filename
        return response

    return jsonify({'error': 'Invalid code or the transfer has expired'}), 400

# Handle OPTIONS requests for CORS preflight
@app.route('/upload', methods=['OPTIONS'])
@app.route('/download', methods=['OPTIONS'])
@cross_origin(origin='https://sharemore.online')
def handle_options():
    return '', 204

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
