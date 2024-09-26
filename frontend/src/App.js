import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Upload from './components/Upload';
import Download from './components/Download';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/download" element={<Download />} />
      </Routes>
    </Router>
  );
};

export default App;