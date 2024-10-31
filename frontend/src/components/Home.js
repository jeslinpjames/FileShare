import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
    <h1 className="text-4xl font-bold mb-6 g-10">Welcome to ShareMore</h1>
    <div className="space-x-4 mb-8">
      <Link
        to="/upload"
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded transition duration-300 ease-in-out shadow-lg transform hover:scale-105"
      >
        Upload a File
      </Link>
      <Link
        to="/download"
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded transition duration-300 ease-in-out shadow-lg transform hover:scale-105"
      >
        Download a File
      </Link>
      <Link
        to="/watchparty"
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded transition duration-300 ease-in-out shadow-lg transform hover:scale-105"
      >
        Watch Party
      </Link>
    </div>
    
  </div>
);

export default Home;
