# ShareMore - File Sharing Website

ShareMore is a cloud-based file-sharing website that allows users to upload and download files securely through a unique code. It also includes a peer-to-peer file sharing feature and a watch party feature, enabling synchronized video playback across multiple users.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [API Endpoints](#api-endpoints)
- [Watch Party](#watch-party)
- [Contributing](#contributing)
- [License](#license)

## Features
- **File Upload and Download**: Upload files and share them through unique codes. Download files by entering the corresponding code.
- **Peer-to-Peer File Sharing**: Share files directly between peers using WebRTC and PeerJS.
- **Watch Party**: Watch YouTube videos in sync with others. Users can create or join a watch party using a unique session code.

## Tech Stack
- **Frontend**: React, Tailwind CSS
- **Backend**: Flask, Flask-CORS, Flask-SocketIO
- **Real-Time Communication**: WebSocket, Socket.IO (for Watch Party)
- **Peer-to-Peer File Sharing**: PeerJS

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/ShareMore.git
   cd ShareMore
   ```

2. **Backend Setup**:
   * Ensure you have Python 3.8+ installed.
   * Install the necessary dependencies:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Frontend Setup**:
   * Install Node.js (v14+ recommended).
   * Navigate to the `frontend` directory and install dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

## Running the Project

1. **Start the Backend**:
   * Navigate to the `backend` directory and activate the virtual environment if not already active.
   * Run the Flask application:
   ```bash
   flask run
   ```
   * For real-time functionality, use Gunicorn with Flask-SocketIO:
   ```bash
   gunicorn --worker-class eventlet -w 1 app:app
   ```

2. **Start the Frontend**:
   * In the `frontend` directory, start the React application:
   ```bash
   npm start
   ```
   * The frontend will be accessible at `http://localhost:3000`.

## Usage

1. **File Upload**:
   * Go to the **Upload** page, select a file, and click **Upload**.
   * You'll receive a unique code to share with the recipient.

2. **File Download**:
   * Go to the **Download** page, enter the code, and download the file.

3. **Peer-to-Peer Sharing**:
   * Navigate to the **P2P File Sharing** page, select a file, enter the recipient's Peer ID, and start the transfer.

4. **Watch Party**:
   * From the home page, go to **Watch Party**.
   * Create or join a party, paste a YouTube link, and enjoy synchronized viewing with others.

## Folder Structure

```
ShareMore/
├── backend/
│   ├── app.py                # Main Flask application
│   ├── transfer_info.json    # Stores active transfers
│   ├── templates/            # HTML templates
│   └── static/               # Static files
├── frontend/
│   ├── public/               # Public assets
│   ├── src/                  # React source code
│   │   ├── components/       # React components
│   │   ├── App.js           # Main app component
│   │   └── index.js         # Entry point
│   └── package.json         # Frontend dependencies
└── README.md                # Project README
```

## API Endpoints

### Upload File
- **Endpoint**: `/api/upload`
- **Method**: `POST`
- **Description**: Uploads a file and returns a unique code for download.

### Download File
- **Endpoint**: `/api/download`
- **Method**: `POST`
- **Description**: Downloads a file using the unique code.

### Additional Endpoints
Further endpoints will be added as new features are implemented, including P2P and Watch Party functionality.

## Watch Party

The Watch Party feature uses Socket.IO for real-time video synchronization. Users can play, pause, and seek within a YouTube video, and these actions will reflect for all participants in the same session.
