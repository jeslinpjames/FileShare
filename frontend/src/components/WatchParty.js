import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import ReactPlayer from 'react-player';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import { MessageCircle, X, Send, Users } from 'lucide-react';

const SERVER_IP = 'https://sharemore.online';

const WatchParty = () => {
  const [room, setRoom] = useState('');
  const [joined, setJoined] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showChat, setShowChat] = useState(true);
  const [users, setUsers] = useState([]);
  const socketRef = useRef();
  const playerRef = useRef(null);
  const chatRef = useRef(null);
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

    socketRef.current.on('chat_message', (data) => {
      // Only add messages if they match the current room
      setMessages(prev => [...prev, data]);
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    });

    socketRef.current.on('user_list_update', (data) => {
      setUsers(data.users);
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
    if (!username.trim()) return;
    const newRoom = generateRoomCode();
    setRoom(newRoom);
    // Clear messages when creating a new room
    setMessages([]);
    setUsers([]);
    setVideoUrl('');
    socketRef.current.emit('join_room', { 
      room: newRoom,
      username: username.trim()
    });
    setJoined(true);
  };

  const joinRoom = () => {
    if (room !== '' && username.trim() !== '') {
      // Clear messages when joining a new room
      setMessages([]);
      setUsers([]);
      setVideoUrl('');
      socketRef.current.emit('join_room', { room, username: username.trim() });
      setJoined(true);
    }
  };


  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socketRef.current.emit('chat_message', {
        room,
        message: message.trim(),
        timestamp: new Date().toISOString()
      });
      setMessage('');
    }
  };

  const ChatMessage = ({ msg }) => {
    const isSystem = msg.type === 'system';
    return (
      <div className={`mb-2 ${isSystem ? 'text-gray-400 text-sm italic' : ''}`}>
        {!isSystem && (
          <span className="font-medium text-blue-400">{msg.username}: </span>
        )}
        <span className="text-gray-200">{msg.content}</span>
      </div>
    );
  };

  const leaveRoom = () => {
    socketRef.current.emit('leave_room', { room });
    setJoined(false);
    setRoom('');
    setVideoUrl('');
    // Clear messages and users when leaving room
    setMessages([]);
    setUsers([]);
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
      <Navbar />
      <div className="min-h-screen bg-gray-900 p-4 md:p-8">
        {!joined ? (
          <div className="max-w-md mx-auto mt-16">
            <h1 className="text-center text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-500 mb-4">
              Watch Party
            </h1>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Choose a display name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={createRoom}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg"
                  disabled={!username.trim()}
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
                  disabled={!username.trim() || !room.trim()}
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
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4">
            {/* Main content area */}
            <div className="flex-1">
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
  
              {!videoUrl ? (
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
              ) : (
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
  
            {/* Chat sidebar */}
            <div className={`w-full md:w-80 bg-gray-800 rounded-lg transition-all duration-300 ${showChat ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
              <div className="h-full flex flex-col">
                {/* Chat header */}
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="text-white font-medium">Users ({users.length})</span>
                  </div>
                  <button
                    onClick={() => setShowChat(false)}
                    className="md:hidden p-1 hover:bg-gray-700 rounded"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
  
                {/* Users list */}
                <div className="p-4 border-b border-gray-700">
                  <div className="space-y-2">
                    {users.map((user, index) => (
                      <div key={index} className="text-gray-300">{user}</div>
                    ))}
                  </div>
                </div>
  
                {/* Chat messages */}
                <div
                  ref={chatRef}
                  className="flex-1 p-4 overflow-y-auto space-y-2"
                >
                  {messages.map((msg, index) => (
                    <ChatMessage key={index} msg={msg} />
                  ))}
                </div>
  
                {/* Chat input */}
                <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
  
            {/* Mobile chat toggle */}
            {!showChat && (
              <button
                onClick={() => setShowChat(true)}
                className="md:hidden fixed bottom-4 right-4 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg"
              >
                <MessageCircle className="w-6 h-6" />
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )};
export default WatchParty;
