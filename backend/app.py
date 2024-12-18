from flask import Flask, request, jsonify, send_file
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS, cross_origin
import json
import random
import string
from io import BytesIO

app = Flask(__name__)

# Allow requests from frontend domain
CORS(app, resources={r"/api/*": {"origins": "https://sharemore.online"}})
socketio = SocketIO(app, cors_allowed_origins="*")


# Store active transfers
active_transfers = {}
current_video = {}
room_users = {}


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


# @socketio.on('join_room')
# def handle_join_room(data):
#     room = data['room']
#     join_room(room)
#     # Emit the current video URL to the new user if a video is already loaded
#     if room in current_video:
#         emit('video_event', {'type': 'url', 'url': current_video[room]}, room=request.sid)
#     emit('user_joined', {'user': request.sid}, room=room)

@socketio.on('join_room')
def handle_join_room(data):
    room = data['room']
    username = data.get('username', 'Anonymous')
    
    if room not in room_users:
        room_users[room] = {}
    
    room_users[room][request.sid] = username
    join_room(room)
    
    # Emit current video URL and user list to new user
    if room in current_video:
        emit('video_event', {'type': 'url', 'url': current_video[room]}, room=request.sid)
    
    # Notify others about new user
    emit('chat_message', {
        'type': 'system',
        'content': f'{username} joined the room'
    }, room=room)
    
    # Send updated user list to all in room
    emit('user_list_update', {
        'users': list(room_users[room].values())
    }, room=room)

# @socketio.on('leave_room')
# def handle_leave_room(data):
#     room = data['room']
#     leave_room(room)
#     emit('user_left', {'user': request.sid}, room=room)

@socketio.on('leave_room')
def handle_leave_room(data):
    room = data['room']
    username = room_users[room].get(request.sid, 'Anonymous')
    
    if room in room_users and request.sid in room_users[room]:
        del room_users[room][request.sid]
        if not room_users[room]:  # If room is empty
            del room_users[room]
    
    leave_room(room)
    
    # Notify others about user leaving
    emit('chat_message', {
        'type': 'system',
        'content': f'{username} left the room'
    }, room=room)
    
    # Send updated user list
    if room in room_users:
        emit('user_list_update', {
            'users': list(room_users[room].values())
        }, room=room)

@socketio.on('chat_message')
def handle_chat_message(data):
    room = data['room']
    username = room_users[room].get(request.sid, 'Anonymous')
    
    emit('chat_message', {
        'type': 'user',
        'username': username,
        'content': data['message'],
        'timestamp': data.get('timestamp')
    }, room=room)

@socketio.on('update_username')
def handle_username_update(data):
    room = data['room']
    new_username = data['username']
    old_username = room_users[room].get(request.sid, 'Anonymous')
    
    room_users[room][request.sid] = new_username
    
    # Notify room about username change
    emit('chat_message', {
        'type': 'system',
        'content': f'{old_username} changed their name to {new_username}'
    }, room=room)
    
    # Send updated user list
    emit('user_list_update', {
        'users': list(room_users[room].values())
    }, room=room)

@socketio.on('video_event')
def handle_video_event(data):
    room = data['room']
    if data['type'] == 'url':
        # Update the current video URL for this room
        current_video[room] = data['url']
    emit('video_event', data, room=room, include_self=False)


# Handle CORS preflight requests
@app.route('/api/upload', methods=['OPTIONS'])
@app.route('/api/download', methods=['OPTIONS'])
@cross_origin(origin='https://sharemore.online')
def handle_options():
    return '', 204

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)
