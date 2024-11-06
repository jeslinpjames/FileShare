import React, { useEffect, useState, useRef } from 'react';
import { Peer } from 'peerjs';
import QRCode from 'react-qr-code';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Navbar from './Navbar';

const P2PFileSharing = () => {
  const [peerId, setPeerId] = useState('Connecting...');
  const [status, setStatus] = useState({ message: '', type: '' });
  const [sendProgress, setSendProgress] = useState(0);
  const [receiveProgress, setReceiveProgress] = useState(0);
  const [receivedFiles, setReceivedFiles] = useState([]);
  const [recipientId, setRecipientId] = useState('');
  const [showSendProgress, setShowSendProgress] = useState(false);
  const [showReceiveProgress, setShowReceiveProgress] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const peerRef = useRef(null);
  const currentConnectionRef = useRef(null);
  const fileChunksRef = useRef([]);
  const currentFileSizeRef = useRef(0);
  const receivedSizeRef = useRef(0);
  const currentFileNameRef = useRef('');
  const scannerRef = useRef(null);

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
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeScanner = () => {
    setShowScanner(true);
    
    // Wait for DOM element to be created
    setTimeout(() => {
      scannerRef.current = new Html5QrcodeScanner("qr-reader", {
        qrbox: { width: 250, height: 250 },
        fps: 5,
      });
  
      scannerRef.current.render(onScanSuccess, onScanError);
    }, 0);
  };

  const onScanSuccess = (decodedText) => {
    setRecipientId(decodedText);
    setShowScanner(false);
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
    updateStatus('QR Code scanned successfully!', 'success');
  };

  const onScanError = (error) => {
    console.warn(`QR Code scan error: ${error}`);
  };

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

  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(peerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gray-900 py-8">
      <h1 className="text-center text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-500 mb-4">
        Share Via P2P
      </h1>
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
          {/* Your Peer ID Section with QR Code */}
          <div className="mb-8">
            <div className="flex flex-col items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Your Peer ID:
                <span className="text-blue-400 font-mono">{peerId}</span>
                <button
                  onClick={handleCopyId}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    copied 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy ID'}
                </button>
              </h2>
              <div className="p-4 bg-white rounded-lg">
                <QRCode value={peerId} size={200} />
              </div>
            </div>
            {status.message && (
              <div className={`p-4 rounded-lg mb-4 ${
                status.type === 'success' 
                  ? 'bg-green-900/50 text-green-300 border border-green-700' 
                  : 'bg-red-900/50 text-red-300 border border-red-700'
              }`}>
                {status.message}
              </div>
            )}
          </div>

          {/* Send File Section with QR Scanner */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Send File
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select File
                </label>
                <input
                type="file"
                onChange={sendFile}
                disabled={!recipientId} // Disable if recipientId is empty
                className={`block w-full text-sm text-gray-400 
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-medium
                file:bg-gray-700 file:text-gray-200
              ${
                !recipientId
                  ? 'cursor-not-allowed opacity-50' // Disabled style
                  : 'hover:file:bg-gray-600 cursor-pointer' // Enabled style
                }
                transition duration-150 ease-in-out`}
              />
                {!recipientId && (
          <p className="text-sm text-red-500 mt-2">
            Please enter a recipient ID or scan QR to enable file selection.
          </p>
        )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recipient's Peer ID
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                    placeholder="Enter recipient's peer ID"
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 
                      rounded-lg text-gray-200 placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      transition duration-150 ease-in-out"
                  />
                  <button
                    onClick={initializeScanner}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500
                      transition duration-150 ease-in-out flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    Scan QR
                  </button>
                </div>
              </div>
              {showScanner && (
                <div className="mt-4">
                  <div id="qr-reader" className="w-full max-w-sm mx-auto"></div>
                </div>
              )}
              {showSendProgress && (
                <div className="relative pt-1">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300
                        relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r 
                        before:from-transparent before:via-white/25 before:to-transparent
                        before:animate-[shimmer_2s_infinite]"
                      style={{ width: `${sendProgress}%` }}
                    >
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Received Files Section */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Received Files
            </h3>
            {showReceiveProgress && (
              <div className="relative pt-1 mb-6">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300
                      relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r 
                      before:from-transparent before:via-white/25 before:to-transparent
                      before:animate-[shimmer_2s_infinite]"
                    style={{ width: `${receiveProgress}%` }}
                  >
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-3">
              {receivedFiles.map((file, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 bg-gray-700/50 
                    rounded-lg border border-gray-600 hover:bg-gray-700 
                    transition duration-150 ease-in-out"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm text-gray-300">{file.name} 
                      <span className="text-gray-500 ml-2">({file.size})</span>
                    </span>
                  </div>
                  <a
                    href={file.url}
                    download={file.name}
                    className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 
                      text-sm font-medium transition duration-150 ease-in-out"
                  >
                    <span>Download</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default P2PFileSharing;