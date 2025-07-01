// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from "../context/Auth";

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-blue-600 text-white px-4 py-3">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Survey App</h1>

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
          <Link to="/" className="hover:underline">Quiz</Link>
          <Link to="/speech" className="hover:underline">Speech</Link>
          <Link to="/response" className="hover:underline">Responses</Link>

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
                className="hover:underline bg-blue-700 px-3 py-1 rounded"
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
          <Link to="/" className="block hover:underline" onClick={() => setIsOpen(false)}>Quiz</Link>
          <Link to="/speech" className="block hover:underline" onClick={() => setIsOpen(false)}>Speech</Link>
          <Link to="/response" className="block hover:underline" onClick={() => setIsOpen(false)}>Responses</Link>

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
                className="hover:underline bg-blue-700 px-3 py-1 rounded"
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
