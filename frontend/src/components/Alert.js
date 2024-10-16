import React from 'react';

const Alert = ({ children, variant = 'info' }) => {
  const bgColor = variant === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-blue-100 border-blue-400 text-blue-700';
  return (
    <div className={`border-l-4 p-4 ${bgColor}`} role="alert">
      <p>{children}</p>
    </div>
  );
};

export default Alert;