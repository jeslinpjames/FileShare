import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Upload from './components/Upload';
import Download from './components/Download';
import P2PFileSharing from './components/P2PFileSharing';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/download" element={<Download />} />
        <Route path="/p2p" element={<P2PFileSharing />} />
      </Routes>
    </Router>
  );
};

export default App;