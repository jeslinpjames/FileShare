import React, { useState } from 'react';
import axios from 'axios';

function Upload() {
  const [file, setFile] = useState(null);
  const [code, setCode] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData);
      setCode(response.data.code);
    } catch (error) {
      console.error("Error uploading file", error);
    }
  };

  return (
    <div className="container">
      <h1>Upload a File</h1>
      {code ? (
        <div>
          <p>Your file transfer code is: <span className="code">{code}</span></p>
        </div>
      ) : (
        <form onSubmit={handleUpload}>
          <input type="file" onChange={handleFileChange} required />
          <button type="submit" className="button">Upload</button>
        </form>
      )}
    </div>
  );
}

export default Upload;
