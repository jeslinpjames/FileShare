from flask import Flask, request, render_template, redirect, url_for
import os
import random
import string
import socket
import threading

app = Flask(__name__)
active_transfers = {}

def generate_random_code(length=6):
    """Generates a random alphanumeric code."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def handle_file_transfer(conn, file):
    """Streams file data directly to the connected client."""
    while True:
        data = file.read(1024)
        if not data:
            break
        conn.sendall(data)
    conn.close()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        file = request.files['file']
        if file:
            code = generate_random_code()
            active_transfers[code] = file
            return render_template('upload.html', code=code)
    return render_template('upload.html', code=None)

@app.route('/download', methods=['GET', 'POST'])
def download_file():
    if request.method == 'POST':
        code = request.form['code']
        if code in active_transfers:
            file = active_transfers.pop(code)
            return stream_file(file)
        else:
            return "Invalid code or the transfer has expired.", 400
    return render_template('download.html')

def stream_file(file):
    """Streams file data directly to the client."""
    def generate():
        while True:
            chunk = file.read(1024)
            if not chunk:
                break
            yield chunk
    return app.response_class(generate(), mimetype='application/octet-stream')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
