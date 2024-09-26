import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from './Alert';

const Download = () => {
  const [code, setCode] = useState('');
  const [downloadSpeed, setDownloadSpeed] = useState({ mbps: 0, MBps: 0 });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const storedData = JSON.parse(localStorage.getItem('uploadResponse'));

    if (!storedData || storedData.code !== code) {
      setError('Invalid code or the transfer has expired');
      return;
    }

    try {
      const startTime = Date.now();
      const response = await fetch('http://localhost:5000/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Invalid code or the transfer has expired');
      }

      const blob = await response.blob();
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000; // in seconds
      const speedMbps = (blob.size * 8) / (1000000 * duration);
      const speedMBps = blob.size / (1000000 * duration);

      setDownloadSpeed({
        mbps: speedMbps.toFixed(2),
        MBps: speedMBps.toFixed(2),
      });

      const filename = storedData.name || 'downloaded_file'; // Fallback filename if not found

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename; // Use the filename from local storage
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      localStorage.removeItem('uploadResponse');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-6">Download a File</h1>
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
        <label htmlFor="code" className="block text-lg mb-2">
          Enter the code provided by the uploader:
        </label>
        <input
          type="text"
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          className="border rounded px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        />
        <div className="flex justify-between mt-4">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            Download
          </button>
          <Link
            to="/"
            className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            Back to Home
          </Link>
        </div>
      </form>
      {error && <Alert variant="error">{error}</Alert>}
      {downloadSpeed.mbps > 0 && (
        <p className="mt-4 text-lg">
          Download Speed: {downloadSpeed.mbps} Mbps | {downloadSpeed.MBps} MBps
        </p>
      )}
    </div>
  );
};

export default Download;
