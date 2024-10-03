import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from './Alert';
import { QRCodeSVG } from 'qrcode.react';

// const SERVER_IP = '192.168.68.3';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [code, setCode] = useState(null);
  const [uploadSpeed, setUploadSpeed] = useState({ mbps: 0, MBps: 0 });
  const [error, setError] = useState(null);

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
      const response = await fetch(`/upload`, {
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

  // Use the fixed IP for the QR code
  // const { protocol, hostname, port } = window.location;
  // const networkUrl = `${protocol}//${hostname}:${port || 3000}`;

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
          <div className="mt-4 flex justify-center">
            {/* <QRCodeSVG value={`${networkUrl}/download?code=${code}`} size={256} /> */}
            <QRCodeSVG
              value={code}
              size={256}
              fgColor="#00000"  // Custom foreground color
              bgColor="#ffffff"  // Custom background color
              level="H"          // Error correction level (L, M, Q, H)
              style={{ borderRadius: '',padding:'10px' ,backgroundColor:'white'}} // Optional styling for rounded edges
            />
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