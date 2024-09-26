import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Upload from './Upload';
import Download from './Download';

function App() {
  return (
    <Router>
      <div className="container">
        <h1>Welcome to the File Sharing Service</h1>
        <div className="buttons">
          <Link to="/upload" className="button">Upload a File</Link>
          <Link to="/download" className="button">Download a File</Link>
        </div>
        <Routes>
          <Route path="/upload" element={<Upload />} />
          <Route path="/download" element={<Download />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
