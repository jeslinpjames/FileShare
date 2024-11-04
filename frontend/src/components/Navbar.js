import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/upload', label: 'Upload' },
    { path: '/download', label: 'Download' },
    { path: '/watchparty', label: 'Watch Party' },
    { path: '/p2p', label: 'P2P Sharing' }
  ];

  return (
    <>
      <nav className="bg-gray-800 fixed w-full top-0 z-50 shadow-lg shadow-gray-950/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <Link 
                to="/" 
                className="text-xl font-bold bg-gradient-to-r from-indigo-500 via-blue-500 to-red-500 text-transparent bg-clip-text"
              >
                ShareMore
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    location.pathname === path
                      ? 'bg-indigo-500/10 text-indigo-400 font-medium'
                      : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/50'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-400 hover:text-gray-100 p-2"
                aria-label="Toggle menu"
              >
                <svg
                  className={`w-6 h-6 ${isMenuOpen ? 'hidden' : 'block'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <svg
                  className={`w-6 h-6 ${isMenuOpen ? 'block' : 'hidden'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div 
          className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} border-t border-gray-800`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-950">
            {navItems.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg transition-colors duration-200 ${
                  location.pathname === path
                    ? 'bg-indigo-500/10 text-indigo-400 font-medium'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/50'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      {/* Spacer div to prevent content overlay */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;