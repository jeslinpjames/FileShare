import React, { useState } from 'react';
import axios from 'axios';

function Download() {
  const [code, setCode] = useState('');
  
  const handleDownload = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('http://localhost:5000/download', { code }, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'file');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading file', error);
    }
  };

  return (
    <div className="container">
      <h1>Download a File</h1>
      <form onSubmit={handleDownload}>
        <input 
          type="text" 
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter the code" 
          required
        />
        <button type="submit" className="button">Download</button>
      </form>
    </div>
  );
}

export default Download;
