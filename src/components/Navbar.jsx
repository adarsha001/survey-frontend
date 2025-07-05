// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from "../context/Auth";
import logo from '../../public/logo.png'; // ✅ Import logo

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-white px-4 py-3 shadow-md">
      <div className="flex justify-between items-center">
        {/* Logo + Title */}
        <div className="flex items-center space-x-2">
          <img src={logo} alt="Voice Survey Logo" className="w-8 h-8 rounded-full" />
          <h1 className="text-xl font-bold">
            <Link to="/" className="hover:underline">Voice Survey</Link>
          </h1>
        </div>

        {/* Hamburger Icon for Mobile */}
        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          <div className="space-y-1">
            <div className="w-6 h-0.5 bg-white"></div>
            <div className="w-6 h-0.5 bg-white"></div>
            <div className="w-6 h-0.5 bg-white"></div>
          </div>
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-4 items-center">
          <Link to="/surveyform" className="hover:underline flex items-center gap-1">
            📝 Create Survey
          </Link>
          <Link to="/speech" className="hover:underline flex items-center gap-1">
            🎤 Take Survey
          </Link>
          <Link to="/response" className="hover:underline flex items-center gap-1">
            📊 View Responses
          </Link>
          <Link to="/my-surveys" className="hover:underline flex items-center gap-1">
            🧑‍💼 My Surveys
          </Link>

          {!isAuthenticated ? (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/register" className="hover:underline">Register</Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <span className="font-medium">Welcome, {user?.username}</span>
              <button
                onClick={logout}
                className="hover:underline bg-gray-600 px-3 py-1 rounded"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden mt-3 space-y-3">
          <Link to="/surveyform" className="block hover:underline" onClick={() => setIsOpen(false)}>
            📝 Create Survey
          </Link>
          <Link to="/speech" className="block hover:underline" onClick={() => setIsOpen(false)}>
            🎤 Take Survey
          </Link>
          <Link to="/response" className="block hover:underline" onClick={() => setIsOpen(false)}>
            📊 View Responses
          </Link>
          <Link to="/my-surveys" className="block hover:underline" onClick={() => setIsOpen(false)}>
            🧑‍💼 My Surveys
          </Link>

          {!isAuthenticated ? (
            <>
              <Link to="/login" className="block hover:underline" onClick={() => setIsOpen(false)}>Login</Link>
              <Link to="/register" className="block hover:underline" onClick={() => setIsOpen(false)}>Register</Link>
            </>
          ) : (
            <>
              <span className="block font-medium">Welcome, {user?.username}</span>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="hover:underline bg-gray-600 px-3 py-1 rounded"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
