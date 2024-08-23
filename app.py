from flask import Flask, request, render_template, redirect, url_for, Response
import os
import random
import string
from io import BytesIO

app = Flask(__name__)
active_transfers = {}

def generate_random_code(length=6):
    """Generates a random alphanumeric code."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        file = request.files['file']
        if file:
            # Read file into a BytesIO object to keep it in memory
            file_content = BytesIO(file.read())
            file_content.seek(0)  # Rewind the file to the beginning
            code = generate_random_code()
            active_transfers[code] = file_content
            return render_template('upload.html', code=code)
    return render_template('upload.html', code=None)

@app.route('/download', methods=['GET', 'POST'])
def download_file():
    if request.method == 'POST':
        code = request.form['code']
        if code in active_transfers:
            file_content = active_transfers.pop(code)  # Get the in-memory file content
            return Response(stream_file(file_content), content_type='application/octet-stream')
        else:
            return "Invalid code or the transfer has expired.", 400
    return render_template('download.html')

def stream_file(file_content):
    """Generator to stream file data directly to the client."""
    while True:
        chunk = file_content.read(1024)
        if not chunk:
            break
        yield chunk

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
