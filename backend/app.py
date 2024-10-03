from flask import Flask, request, jsonify, Response
import os
import random
import string
from io import BytesIO
from urllib.parse import quote
from flask_cors import CORS
import json


app = Flask(__name__)
active_transfers = {}
CORS(app)
CORS(app, resources={r"/*": {"origins": "*"}})


def generate_random_code(length=6):
    """Generates a random alphanumeric code."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    if file:
        file_content = BytesIO(file.read())
        file_content.seek(0)
        code = generate_random_code()
        active_transfers[code] = {
            'file_content': file_content,
            'filename': file.filename,
            'file_size': len(file_content.getvalue())
        }
        json_data = {
            'filename': file.filename,
            'code':code
        }
        with open('transfer_info.json','w') as json_file:
            json.dump(json_data,json_file)
        return jsonify({'code': code,'name':file.filename})
    return jsonify({'error': 'No file provided'}), 400

@app.route('/download', methods=['POST'])
def download_file():
    data = request.get_json()
    print("Received data:", data)  
    code = data.get('code')
    
    # Load the filename from the JSON file
    with open('transfer_info.json', 'r') as json_file:
        json_data = json.load(json_file)
        file_name = json_data['filename']
    
    if code in active_transfers:
        transfer_info = active_transfers.pop(code)
        file_content = transfer_info['file_content']
        filename = transfer_info['filename']
        quoted_filename = quote(filename)

        print(f"Downloading file: {filename}")

        response = Response(
            stream_file(file_content),
            content_type='application/octet-stream',
            headers={
                "Content-Disposition": f"attachment;filename*=UTF-8''{quoted_filename}",
                "Content-Length": str(len(file_content.getvalue()))
            }
        )
        response.headers['Filename'] = file_name
        response.headers['Access-Control-Expose-Headers'] = 'Filename'
        return response
    else:
        print("Invalid code or transfer expired")
        return jsonify({'error': 'Invalid code or the transfer has expired'}), 400


def stream_file(file_content):
    while True:
        chunk = file_content.read(1024)
        if not chunk:
            break
        yield chunk

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
