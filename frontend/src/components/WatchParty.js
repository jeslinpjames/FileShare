import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import ReactPlayer from 'react-player';
import { Link } from 'react-router-dom';
import SERVER_IP from './Config';

const WatchParty = () => {
  const [room, setRoom] = useState('');
  const [joined, setJoined] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const socketRef = useRef();
  const playerRef = useRef(null);
  const isControlledRef = useRef(false);

  useEffect(() => {
    socketRef.current = io(SERVER_IP);

    socketRef.current.on('connect', () => {
      console.log('Connected to SocketIO server');
    });

    socketRef.current.on('video_event', (data) => {
      if (data.type === 'url') {
        setVideoUrl(data.url); // Set the video URL when received
      } else if (data.type === 'play' && playerRef.current) {
        isControlledRef.current = true;
        playerRef.current.seekTo(data.currentTime);
        playerRef.current.getInternalPlayer().playVideo();
      } else if (data.type === 'pause' && playerRef.current) {
        isControlledRef.current = true;
        playerRef.current.seekTo(data.currentTime);
        playerRef.current.getInternalPlayer().pauseVideo();
      } else if (data.type === 'seek' && playerRef.current) {
        isControlledRef.current = true;
        playerRef.current.seekTo(data.currentTime);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const generateRoomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const createRoom = () => {
    const newRoom = generateRoomCode();
    setRoom(newRoom);
    socketRef.current.emit('join_room', { room: newRoom });
    setJoined(true);
  };

  const joinRoom = () => {
    if (room !== '') {
      socketRef.current.emit('join_room', { room });
      setJoined(true);
    }
  };

  const leaveRoom = () => {
    socketRef.current.emit('leave_room', { room });
    setJoined(false);
    setRoom('');
    setVideoUrl('');
  };

  const handlePlay = () => {
    if (isControlledRef.current) {
      isControlledRef.current = false;
      return;
    }
    const currentTime = playerRef.current.getCurrentTime();
    socketRef.current.emit('video_event', {
      room,
      type: 'play',
      currentTime,
    });
  };

  const handlePause = () => {
    if (isControlledRef.current) {
      isControlledRef.current = false;
      return;
    }
    const currentTime = playerRef.current.getCurrentTime();
    socketRef.current.emit('video_event', {
      room,
      type: 'pause',
      currentTime,
    });
  };

  const handleSeek = (e) => {
    if (isControlledRef.current) {
      isControlledRef.current = false;
      return;
    }
    socketRef.current.emit('video_event', {
      room,
      type: 'seek',
      currentTime: e,
    });
  };

  const handleUrlSubmit = () => {
    setVideoUrl(inputUrl);
    socketRef.current.emit('video_event', {
      room,
      type: 'url',
      url: inputUrl,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      {!joined ? (
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-6">Watch Party</h1>
          {isCreating ? (
            <>
              <button
                onClick={createRoom}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
              >
                Create Room
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Back
              </button>
            </>
          ) : (
            <>
              <div className="mb-4">
                <button
                  onClick={() => setIsCreating(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
                >
                  Create Room
                </button>
                <h2 className="text-2xl font-bold mb-2">OR</h2>
                <input
                  type="text"
                  placeholder="Enter room code"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="mb-2 p-2 rounded bg-gray-800 text-white"
                />
                <button
                  onClick={joinRoom}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Join Room
                </button>
              </div>
            </>
          )}
          <Link
            to="/"
            className="mt-4 bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded"
          >
            Back to Home
          </Link>
        </div>
      ) : (
        <div className="w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">Room Code: {room}</h2>
          {!videoUrl && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Enter YouTube URL"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="mb-2 p-2 rounded bg-gray-800 text-white w-full"
              />
              <button
                onClick={handleUrlSubmit}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Load Video
              </button>
            </div>
          )}
          {videoUrl && (
            <ReactPlayer
              ref={playerRef}
              url={videoUrl}
              controls={true}
              playing={false}
              onPlay={handlePlay}
              onPause={handlePause}
              onSeek={handleSeek}
              width="100%"
              height="480px"
            />
          )}
          <button
            onClick={leaveRoom}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Leave Room
          </button>
        </div>
      )}
    </div>
  );
};

export default WatchParty;
