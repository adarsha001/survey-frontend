// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from "../context/Auth";
import { 
  FaMicrophone, 
  FaFileAlt, 
  FaChartBar, 
  FaUserCircle, 
  FaSignInAlt, 
  FaUserPlus,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaClipboardList,
  FaHome
} from 'react-icons/fa';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo + Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8  rounded-full flex items-center justify-center">
          <img src="logo.png" alt="" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              <Link to="/" className="hover:opacity-80 transition flex items-center gap-2">
                {/* <FaHome className="text-blue-400 text-lg" /> */}
                Voice Survey
              </Link>
            </h1>
          </div>

          {/* Hamburger Icon for Mobile */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link 
              to="/surveyform" 
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200 flex items-center gap-2"
            >
              <FaFileAlt className="text-blue-400" size={16} />
              Create Survey
            </Link>
            
            <Link 
              to="/speech" 
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200 flex items-center gap-2"
            >
              <FaMicrophone className="text-purple-400" size={16} />
              Take Survey
            </Link>
            
            <Link 
              to="/response" 
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200 flex items-center gap-2"
            >
              <FaChartBar className="text-green-400" size={16} />
              View Responses
            </Link>
            
            <Link 
              to="/my-surveys" 
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200 flex items-center gap-2"
            >
              <FaClipboardList className="text-yellow-400" size={16} />
              My Surveys
            </Link>

            {!isAuthenticated ? (
              <div className="flex items-center gap-2 ml-4">
                <Link 
                  to="/login" 
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 flex items-center gap-2"
                >
                  <FaSignInAlt size={14} />
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200 flex items-center gap-2"
                >
                  <FaUserPlus size={14} />
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4 ml-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-800">
                  <FaUserCircle className="text-blue-400" size={18} />
                  <span className="text-sm font-medium text-gray-300">
                    {user?.username}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-all duration-200 flex items-center gap-2"
                >
                  <FaSignOutAlt size={14} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-gray-700 mt-2">
            <Link 
              to="/surveyform" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <FaFileAlt className="text-blue-400" size={18} />
              Create Survey
            </Link>
            
            <Link 
              to="/speech" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <FaMicrophone className="text-purple-400" size={18} />
              Take Survey
            </Link>
            
            <Link 
              to="/response" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <FaChartBar className="text-green-400" size={18} />
              View Responses
            </Link>
            
            <Link 
              to="/my-surveys" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <FaClipboardList className="text-yellow-400" size={18} />
              My Surveys
            </Link>

            {!isAuthenticated ? (
              <>
                <Link 
                  to="/login" 
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <FaSignInAlt size={18} />
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <FaUserPlus size={18} />
                  Register
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 px-3 py-2 text-gray-300">
                  <FaUserCircle className="text-blue-400" size={18} />
                  <span className="font-medium">{user?.username}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:text-white hover:bg-red-600 transition-colors"
                >
                  <FaSignOutAlt size={18} />
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}