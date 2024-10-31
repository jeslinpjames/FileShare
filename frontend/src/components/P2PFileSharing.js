import React, { useEffect, useState, useRef } from 'react';
import { Peer } from 'peerjs';

const P2PFileSharing = () => {
  const [peerId, setPeerId] = useState('Connecting...');
  const [status, setStatus] = useState({ message: '', type: '' });
  const [sendProgress, setSendProgress] = useState(0);
  const [receiveProgress, setReceiveProgress] = useState(0);
  const [receivedFiles, setReceivedFiles] = useState([]);
  const [recipientId, setRecipientId] = useState('');
  const [showSendProgress, setShowSendProgress] = useState(false);
  const [showReceiveProgress, setShowReceiveProgress] = useState(false);

  const peerRef = useRef(null);
  const currentConnectionRef = useRef(null);
  const fileChunksRef = useRef([]);
  const currentFileSizeRef = useRef(0);
  const receivedSizeRef = useRef(0);
  const currentFileNameRef = useRef('');
  // const localIP = '35.200.252.185';
  
  useEffect(() => {
    peerRef.current = new Peer({
      host: '0.peerjs.com',
      port: 443,
      secure: true,
      debug: 3
    });

    peerRef.current.on('open', (id) => {
      console.log('My peer ID is: ' + id);
      setPeerId(id);
      updateStatus('Connected to server', 'success');
    });

    peerRef.current.on('error', (error) => {
      console.error('PeerJS error:', error);
      updateStatus('Connection error: ' + error, 'error');
    });

    peerRef.current.on('disconnected', () => {
      updateStatus('Disconnected from server. Attempting to reconnect...', 'error');
      peerRef.current.reconnect();
    });

    peerRef.current.on('connection', (conn) => {
      currentConnectionRef.current = conn;
      setupConnection(conn);
    });

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setupConnection = (conn) => {
    conn.on('data', (data) => {
      if (data.type === 'file-info') {
        receiveFileInfo(data);
      } else if (data.type === 'file-chunk') {
        receiveFileChunk(data);
      }
    });

    conn.on('error', (error) => {
      console.error('Connection error:', error);
      updateStatus('Connection error: ' + error, 'error');
    });
  };

  const sendFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !recipientId) {
      updateStatus('Please select a file and enter recipient ID', 'error');
      return;
    }

    updateStatus('Connecting to peer...', 'success');
    const conn = peerRef.current.connect(recipientId);
    currentConnectionRef.current = conn;

    conn.on('open', () => {
      updateStatus('Connected to peer. Starting file transfer...', 'success');
      conn.send({
        type: 'file-info',
        name: file.name,
        size: file.size
      });

      const chunkSize = 16384; // 16KB chunks
      const reader = new FileReader();
      let offset = 0;
      
      setShowSendProgress(true);

      reader.onload = (e) => {
        conn.send({
          type: 'file-chunk',
          data: e.target.result
        });

        offset += e.target.result.byteLength;
        const progress = (offset / file.size) * 100;
        setSendProgress(progress);

        if (offset < file.size) {
          readChunk();
        } else {
          updateStatus('File sent successfully!', 'success');
          setShowSendProgress(false);
        }
      };

      const readChunk = () => {
        const slice = file.slice(offset, offset + chunkSize);
        reader.readAsArrayBuffer(slice);
      };

      readChunk();
    });
  };

  const receiveFileInfo = (data) => {
    currentFileNameRef.current = data.name;
    currentFileSizeRef.current = data.size;
    fileChunksRef.current = [];
    receivedSizeRef.current = 0;
    setShowReceiveProgress(true);
    updateStatus('Receiving file: ' + data.name, 'success');
  };

  const receiveFileChunk = (data) => {
    fileChunksRef.current.push(data.data);
    receivedSizeRef.current += data.data.byteLength;
    
    const progress = (receivedSizeRef.current / currentFileSizeRef.current) * 100;
    setReceiveProgress(progress);

    if (receivedSizeRef.current === currentFileSizeRef.current) {
      const blob = new Blob(fileChunksRef.current);
      const url = URL.createObjectURL(blob);
      
      setReceivedFiles(prev => [...prev, {
        name: currentFileNameRef.current,
        size: formatBytes(currentFileSizeRef.current),
        url
      }]);
      
      fileChunksRef.current = [];
      setShowReceiveProgress(false);
      updateStatus('File received successfully!', 'success');
    }
  };

  const updateStatus = (message, type) => {
    setStatus({ message, type });
  };

  const formatBytes = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(100 * (bytes / Math.pow(1024, i))) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Your Peer ID: 
            <span className="text-blue-600 ml-2">{peerId}</span>
          </h2>
          {status.message && (
            <div className={`p-4 rounded-md mb-4 ${
              status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {status.message}
            </div>
          )}
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Send File</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <input
                type="file"
                onChange={sendFile}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient's Peer ID
              </label>
              <input
                type="text"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                placeholder="Enter recipient's peer ID"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md 
                  shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {showSendProgress && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${sendProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Received Files</h3>
          {showReceiveProgress && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${receiveProgress}%` }}
              ></div>
            </div>
          )}
          <div className="space-y-2">
            {receivedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-600">{file.name} ({file.size})</span>
                <a
                  href={file.url}
                  download={file.name}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default P2PFileSharing;