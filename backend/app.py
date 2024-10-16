from flask import Flask, request, jsonify, Response, send_file
import os
import random
import string
from urllib.parse import quote
from flask_cors import CORS
import json
import sys

sys.stdout.flush()

app = Flask(__name__)
active_transfers = {}
CORS(app)
CORS(app, resources={r"/*": {"origins": "*"}})

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def generate_random_code(length=6):
    """Generates a random alphanumeric code."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    if file:
        # Save the file to disk in the uploads folder
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)  # This will save the file to disk

        code = generate_random_code()
        active_transfers[code] = {
            'file_path': file_path,
            'filename': file.filename
        }

        json_data = {
            'filename': file.filename,
            'code': code
        }
        # Save transfer info to JSON file
        with open('transfer_info.json', 'w') as json_file:
            json.dump(json_data, json_file)

        print(f"File uploaded successfully: {file.filename}, Code: {code}")
        return jsonify({'code': code, 'name': file.filename})
    return jsonify({'error': 'No file provided'}), 400

@app.route('/download', methods=['POST'])
def download_file():
    data = request.get_json()
    code = data.get('code')

    # Debugging - Log the incoming request
    print(f"Received download request. Code: {code}")

    try:
        # Load the filename from the JSON file
        with open('transfer_info.json', 'r') as json_file:
            json_data = json.load(json_file)
            file_name = json_data.get('filename', None)

        print(f"Filename loaded from transfer_info.json: {file_name}")

        # Debugging - Check if the code exists in active_transfers
        if code in active_transfers:
            transfer_info = active_transfers.pop(code)
            file_path = transfer_info['file_path']  # Get the file path from active_transfers
            filename = transfer_info['filename']
            quoted_filename = quote(filename)

            print(f"Attempting to download file: {filename}, Path: {file_path}")

            # Debugging - Check if the file exists on disk
            if os.path.exists(file_path):
                print(f"File found at path: {file_path}. Preparing to send.")
                # Use download_name instead of attachment_filename
                return send_file(
                    file_path,
                    as_attachment=True,
                    download_name=filename
                )
            else:
                print(f"File not found at path: {file_path}")
                return jsonify({'error': 'File not found'}), 400
        else:
            print(f"Invalid code or transfer expired. Code: {code}")
            return jsonify({'error': 'Invalid code or transfer expired'}), 400
    except Exception as e:
        # Debugging - Log the error
        print(f"Error during file download: {str(e)}")
        return jsonify({'error': 'Internal server error occurred'}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
