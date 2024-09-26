from flask import Flask, request, jsonify, Response
import os
import random
import string
from io import BytesIO
from urllib.parse import quote
from flask_cors import CORS


app = Flask(__name__)
active_transfers = {}
CORS(app)

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
        return jsonify({'code': code})
    return jsonify({'error': 'No file provided'}), 400

@app.route('/download', methods=['POST'])
def download_file():
    data = request.get_json()
    code = data.get('code')
    if code in active_transfers:
        transfer_info = active_transfers.pop(code)
        file_content = transfer_info['file_content']
        filename = transfer_info['filename']
        quoted_filename = quote(filename)

        return Response(
            stream_file(file_content),
            content_type='application/octet-stream',
            headers={
                "Content-Disposition": f"attachment;filename*=UTF-8''{quoted_filename}",
                "Content-Length": str(len(file_content.getvalue()))
            }
        )
    else:
        return jsonify({'error': 'Invalid code or the transfer has expired'}), 400

def stream_file(file_content):
    while True:
        chunk = file_content.read(1024)
        if not chunk:
            break
        yield chunk

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
