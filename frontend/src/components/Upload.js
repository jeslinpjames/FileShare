import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Alert from './Alert';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [code, setCode] = useState(null);
  const [uploadSpeed, setUploadSpeed] = useState({ mbps: 0, MBps: 0 });
  const [error, setError] = useState(null);
  const [localIP, setLocalIP] = useState('');

  // Fetch the local IP address from ipify
  useEffect(() => {
    const fetchLocalIP = async () => {
      try {
        const response = await axios.get('https://api64.ipify.org?format=json');
        setLocalIP(response.data.ip);
      } catch (err) {
        console.error('Error fetching local IP:', err);
      }
    };

    fetchLocalIP();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const startTime = Date.now();

    try {
      const response = await fetch('http://172.16.66.82:5000/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('uploadResponse', JSON.stringify(data));
        setCode(data.code);
        setError(null);
      } else {
        setError(data.error || 'Failed to upload the file');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('An error occurred during the upload.');
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // in seconds
    const speedMbps = (file.size * 8) / (1000000 * duration);
    const speedMBps = file.size / (1000000 * duration);

    setUploadSpeed({
      mbps: speedMbps.toFixed(2),
      MBps: speedMBps.toFixed(2),
    });
  };

  // Use the local IP for the QR code
  const networkUrl = `${window.location.protocol}//${localIP}:${process.env.REACT_APP_PORT || 3000}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-6 min-h-full">Upload a File</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {code ? (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-full max-w-md text-center">
          <Alert>
            Your file transfer code is: <span className="font-bold">{code}</span>
          </Alert>
          <p className="mt-2">Share this code with the recipient to allow them to download the file.</p>
          <p className="mt-2">
            Upload Speed: {uploadSpeed.mbps} Mbps | {uploadSpeed.MBps} MBps
          </p>
          {/* QR Code to redirect to /downloads with the transfer code */}
          <div className="mt-4 flex justify-center">
            <QRCodeSVG value={`${networkUrl}/downloads?code=${code}`} size={128} />
          </div>
          <p className="mt-2 mb-5">Scan this QR code to download the file.</p>
          <Link to="/" className="mt-4 bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
            Back to Home
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-lg shadow-lg w-full max-w-md space-y-4">
          <input
            type="file"
            onChange={handleFileChange}
            required
            className="block mx-auto bg-gray-700 text-white p-2 rounded"
          />
          <div className="flex justify-between space-x-4 mt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out mb-5"
            >
              Upload
            </button>
            <Link to="/" className="flex-1 bg-blue-400 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out mb-5">
              Back to Home
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default Upload;
