import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-center px-6 py-16">
      <div className="max-w-md text-white">
        <h1 className="text-7xl font-bold text-blue-600 animate-bounce mb-6">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-gray-400 mb-6">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
