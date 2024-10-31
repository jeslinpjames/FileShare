import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Alert from './Alert';
import { Html5QrcodeScanner } from "html5-qrcode";
import SERVER_IP from './Config';

const Download = () => {
  const [code, setCode] = useState('');
  const [downloadSpeed, setDownloadSpeed] = useState({ mbps: 0, MBps: 0 });
  const [error, setError] = useState(null);
  const [scanResult, setScanResult] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const location = useLocation();
  const scannerRef = useRef(null);

  const handleSubmit = useCallback(async (inputCode) => {
    setError(null);

    try {
      const startTime = Date.now();
      const response = await fetch(`${SERVER_IP}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: inputCode || code }),
      });
      console.log("Sending code:", inputCode || code);

      if (!response.ok) {
        throw new Error('Invalid code or the transfer has expired');
      }

      const blob = await response.blob();
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
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
    } catch (err) {
      setError(err.message);
    }
  }, [code]);

  const handleScanSuccess = useCallback((result) => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScanResult(result);
    setCode(result);
    setIsScanning(false);
    handleSubmit(result);
  }, [handleSubmit]);

  const handleScanError = (err) => {
    console.warn(err);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const scannedCode = params.get('code');

    if (scannedCode) {
      setCode(scannedCode);
      handleSubmit(scannedCode);
    }
  }, [location.search, handleSubmit]);

  useEffect(() => {
    if (isScanning && !scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner('reader', {
        qrbox: {
          width: 250,
          height: 250
        },
        fps: 6
      });

      scannerRef.current.render(handleScanSuccess, handleScanError);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, [isScanning, handleScanSuccess]);

  const toggleScanner = () => {
    setIsScanning(!isScanning);
    setScanResult('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-4">
            Download Your File
          </h1>
          <p className="text-gray-400 text-lg">
            Enter the transfer code or scan the QR code to download
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto bg-gray-800/50 border border-gray-700 rounded-xl p-6 md:p-8">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} 
            className="space-y-6"
          >
            {/* Code Input Section */}
            <div className="space-y-2">
              <label htmlFor="code" className="block text-lg text-gray-300">
                Transfer Code
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                placeholder="Enter your transfer code"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg 
                          text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 
                          focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
              />
            </div>

            {/* QR Scanner Section */}
            {isScanning && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                <div id='reader' className="overflow-hidden rounded-lg"></div>
              </div>
            )}

            {/* Scan Result */}
            {scanResult && (
              <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
                <p className="text-blue-400">Scanned Code: <span className="font-mono font-bold">{scanResult}</span></p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-center">
                {error}
              </div>
            )}

            {/* Download Speed */}
            {downloadSpeed.mbps > 0 && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                <div className="flex justify-center gap-8 text-gray-400">
                  <div>
                    <p className="text-sm">Download Speed</p>
                    <p className="text-lg font-semibold text-green-400">{downloadSpeed.mbps} Mbps</p>
                  </div>
                  <div>
                    <p className="text-sm">Transfer Rate</p>
                    <p className="text-lg font-semibold text-green-400">{downloadSpeed.MBps} MBps</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 
                         rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
              
              <button
                type="button"
                onClick={toggleScanner}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 
                         rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                {isScanning ? 'Stop Scanning' : 'Scan QR Code'}
              </button>

              <Link
                to="/"
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 
                         rounded-lg transition-colors duration-200 text-center"
              >
                Back to Home
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Download;
