import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Alert from './Alert';

const Download = () => {
  const [code, setCode] = useState('');
  const [downloadSpeed, setDownloadSpeed] = useState({ mbps: 0, MBps: 0 });
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Extract code from the query parameters in the URL
    const params = new URLSearchParams(location.search);
    const scannedCode = params.get('code');

    if (scannedCode) {
      setCode(scannedCode);
      handleSubmit(scannedCode); // Trigger download automatically if code is present
    }
  }, [location.search]);

  const handleSubmit = async (inputCode) => {
    setError(null);

    try {
      const startTime = Date.now();
      const response = await fetch(`/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: inputCode || code }),
      });
      console.log("Sending code:", code);

      if (!response.ok) {
        throw new Error('Invalid code or the transfer has expired');
      }
  
      // Get filename from the response header
      // const disposition = response.headers.get('Content-Disposition');
  
      // console.log('Content-Disposition header:', disposition);
  
      // if (disposition) {
      //   // Updated regex to handle URL-encoded filenames
      //   const filenameRegex = /filename\*?=['"]?UTF-8''([^;\n]+)['"]?/i;
      //   const matches = filenameRegex.exec(disposition);
      //   if (matches !== null && matches[1]) {
      //     filename = decodeURIComponent(matches[1]);  // Decode URL-encoded filename
      //     console.log('Parsed filename:', filename);  // Log the parsed filename
      //   }
      // }
  
      const blob = await response.blob();
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000; // in seconds
      const speedMbps = (blob.size * 8) / (1000000 * duration);
      const speedMBps = blob.size / (1000000 * duration);
  
      setDownloadSpeed({
        mbps: speedMbps.toFixed(2),
        MBps: speedMBps.toFixed(2),
      });

      const filename = response.headers.get('Filename') || 'downloaded_file';

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError(error.message);
    }
  };
 
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-6">Download a File</h1>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
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
