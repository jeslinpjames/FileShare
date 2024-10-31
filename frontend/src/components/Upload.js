import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import SERVER_IP from './Config';
import Navbar from './Navbar';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [code, setCode] = useState(null);
  const [uploadSpeed, setUploadSpeed] = useState({ mbps: 0, MBps: 0 });
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCopyCode = async () => {
    if (code) {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy code:', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const startTime = Date.now();

    try {
      const response = await fetch(`${SERVER_IP}/upload`, {
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
    const duration = (endTime - startTime) / 1000;
    const speedMbps = (file.size * 8) / (1000000 * duration);
    const speedMBps = file.size / (1000000 * duration);

    setUploadSpeed({
      mbps: speedMbps.toFixed(2),
      MBps: speedMBps.toFixed(2),
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 mb-4">
              Upload
            </h1>
            <p className="text-gray-400 text-lg">
              Share files
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          {/* Success State - After Upload */}
          {code ? (
            <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-xl p-6 md:p-8 max-w-2xl mx-auto">
              <div className="text-center space-y-6">
                {/* Transfer Code Section */}
                <div className="bg-gray-900 bg-opacity-50 rounded-lg p-6 border border-gray-700">
                  <h2 className="text-xl text-gray-400 mb-2">Your Transfer Code</h2>
                  <div className="flex items-center justify-center gap-3">
                    <p className="text-3xl font-mono font-bold text-blue-400">{code}</p>
                    <button
                      onClick={handleCopyCode}
                      className={`p-2 rounded-lg transition-colors duration-200 ${
                        copied 
                          ? 'bg-green-500 bg-opacity-10 text-green-500'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {copied ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {copied && (
                    <p className="text-green-500 text-sm mt-2">Copied to clipboard!</p>
                  )}
                </div>

                {/* Upload Speed Info */}
                <div className="flex justify-center gap-8 text-gray-400">
                  <div>
                    <p className="text-sm">Upload Speed</p>
                    <p className="text-lg font-semibold">{uploadSpeed.mbps} Mbps</p>
                  </div>
                  <div>
                    <p className="text-sm">Transfer Rate</p>
                    <p className="text-lg font-semibold">{uploadSpeed.MBps} MBps</p>
                  </div>
                </div>

                {/* QR Code Container */}
                <div className="bg-white p-4 rounded-lg inline-block mx-auto">
                  <QRCodeSVG 
                    value={code}
                    size={200}
                    level="H"
                  />
                </div>
                
                <p className="text-gray-400">
                  Scan QR code or share the transfer code to download
                </p>

                {/* Action Button */}
                <Link
                  to="/"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          ) : (
            /* Upload State */
            <div className="max-w-2xl mx-auto bg-gray-800 bg-opacity-50 border border-gray-700 rounded-xl p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors duration-200">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    required
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer block"
                  >
                    <div className="text-gray-400">
                      <svg
                        className="mx-auto h-12 w-12 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-lg mb-2">Drop your file here or click to browse</p>
                      {file && (
                        <div className="mt-4 p-3 bg-gray-900 bg-opacity-50 rounded-lg">
                          <p className="font-medium text-blue-400">Selected file:</p>
                          <p className="text-gray-300">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!file}
                  >
                    {file ? 'Upload File' : 'Select a File'}
                  </button>
                  <Link
                    to="/"
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors duration-200"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Upload;