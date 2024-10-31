import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import ReactPlayer from 'react-player';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

const SERVER_IP = 'https://sharemore.online'; 


const WatchParty = () => {
  const [room, setRoom] = useState('');
  const [joined, setJoined] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  // const [isCreating, setIsCreating] = useState(false);
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
        setVideoUrl(data.url); // Set video URL if received 
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

  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      {!joined ? (
        <div className="max-w-md mx-auto mt-16">
          <h1 className="text-center text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-500 mb-4">
            Watch Party
          </h1>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <button
                onClick={createRoom}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg"
              >
                Create New Room
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-sm text-gray-400 bg-gray-900">or join existing</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter room code"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={joinRoom}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg"
              >
                Join Room
              </button>
            </div>
          </div>
          
          <Link
  to="/"
  className="block text-center mt-8 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg px-4 py-2 transition duration-200"
>
  Back to Home
</Link>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-medium text-white">Room: {room}</h2>
                <button
                  onClick={handleCopyCode}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    copied 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
              <p className="text-sm text-gray-400">Share this code with friends to let them join</p>
            </div>
            <button
              onClick={leaveRoom}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Leave Room
            </button>
          </div>
          
          {!videoUrl && (
            <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-white mb-4">Add a video to watch</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Paste YouTube URL here"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={handleUrlSubmit}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Start Watching
                </button>
              </div>
            </div>
          )}
          
          {videoUrl && (
            <div className="rounded-lg overflow-hidden bg-gray-800">
              <ReactPlayer
                ref={playerRef}
                url={videoUrl}
                controls={true}
                playing={false}
                onPlay={handlePlay}
                onPause={handlePause}
                onSeek={handleSeek}
                width="100%"
                height="calc(100vh - 200px)"
                className="aspect-video"
              />
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
};
export default WatchParty;
