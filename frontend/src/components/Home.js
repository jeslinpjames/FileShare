import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import { Upload, Download, Users, RefreshCcw } from 'lucide-react'; // Import icons from lucide-react

const FeatureCard = ({ to, title, description, bgColor, iconColor, borderColor }) => {
  const renderIcon = () => {
    switch (to) {
      case "/upload":
        return <Upload size={40} className={`${iconColor}`} />;
      case "/download":
        return <Download size={40} className={`${iconColor}`} />;
      case "/watchparty":
        return <Users size={40} className={`${iconColor}`} />;
      case "/p2p":
        return <RefreshCcw size={40} className={`${iconColor}`} />;
      default:
        return null;
    }
  };

  return (
    <Link
      to={to}
      className={`group p-8 rounded-2xl transition-all duration-300 ease-in-out
        hover:scale-102 flex flex-col items-center text-center
        ${bgColor} ${borderColor} border backdrop-blur-sm
        hover:shadow-lg hover:shadow-indigo-500/10`}
    >
      <div className={`mb-6 group-hover:scale-110 transition-transform duration-300`}>
        {renderIcon()}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-slate-300 text-sm leading-relaxed">{description}</p>
      <div className="flex items-center mt-6 text-indigo-300 font-medium">
        Explore
        <span className="ml-2 group-hover:ml-3 transition-all duration-300">→</span>
      </div>
    </Link>
  );
};

const Home = () => (
  <>
    <Navbar />
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold mb-8 text-white">
            Welcome to
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent ml-3">
              ShareMore
            </span>
          </h1>
          <p className="text-slate-300 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Share files securely, watch content together, and connect with others in real-time.
          </p>
        </div>

        <div id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            to="/upload"
            title="Upload Files"
            description="Share your files securely"
            bgColor="bg-slate-900/50"
            borderColor="border-slate-800"
            iconColor="text-indigo-400"
          />
          <FeatureCard
            to="/download"
            title="Download Files"
            description="Access shared files instantly"
            bgColor="bg-slate-900/50"
            borderColor="border-slate-800"
            iconColor="text-indigo-400"
          />
          <FeatureCard
            to="/watchparty"
            title="Watch Party"
            description="Enjoy synchronized video watching with friends"
            bgColor="bg-slate-900/50"
            borderColor="border-slate-800"
            iconColor="text-indigo-400"
          />
          <FeatureCard
            to="/p2p"
            title="P2P Sharing"
            description="Direct peer-to-peer file sharing for privacy"
            bgColor="bg-slate-900/50"
            borderColor="border-slate-800"
            iconColor="text-indigo-400"
          />
        </div>
      </div>
    </div>
  </>
);

export default Home;
