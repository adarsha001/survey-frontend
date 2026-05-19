// HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Surveyresponse from '../Surveyresponse';

const HomePage = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse [animation-delay:1s]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-6">
                <span className="mr-2">🎤</span>
                Voice-Activated Surveys
              </div>
              
              {/* Main Title */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
                Voice Survey
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Platform</span>
              </h1>
              
              {/* Description */}
              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                Interactive voice-powered surveys that respond to your speech. 
                Questions unlock as you speak — creating an immersive experience.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => navigate('/surveyform')}
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xl">✍️</span>
                    Create New Survey
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
                
                <button
                  onClick={() => navigate('/response')}
                  className="px-8 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-white rounded-xl text-lg font-semibold hover:bg-gray-800 transition-all duration-300 hover:border-blue-500/50 shadow-lg flex items-center gap-2"
                >
                  <span className="text-xl">📊</span>
                  View Responses
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🎙️</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Voice Recognition</h3>
              <p className="text-gray-400">Speak naturally and your answers are captured in real-time with high accuracy.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 group">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🔓</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Voice-Activated</h3>
              <p className="text-gray-400">Questions unlock only when you speak them, ensuring active participation.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 group">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Analytics Dashboard</h3>
              <p className="text-gray-400">View and analyze survey responses with detailed insights and charts.</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl p-8 border border-blue-500/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-white">Real-time</div>
                <div className="text-gray-400 mt-1">Speech Processing</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">100%</div>
                <div className="text-gray-400 mt-1">Voice Interactive</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-gray-400 mt-1">Available</div>
              </div>
            </div>
          </div>
        </div>

        {/* Survey List Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Available Surveys</h2>
              <p className="text-gray-400">Browse and participate in voice-enabled surveys</p>
            </div>
            <div className="text-sm text-gray-400 bg-gray-800/50 px-4 py-2 rounded-lg">
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
            <Surveyresponse />
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-800 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎤</span>
                <span className="text-gray-400">Voice Survey Platform</span>
              </div>
              <div className="flex gap-6">
                <button 
                  onClick={() => navigate('/surveyform')} 
                  className="text-gray-400 hover:text-white transition text-sm"
                >
                  Create Survey
                </button>
                <button 
                  onClick={() => navigate('/response')} 
                  className="text-gray-400 hover:text-white transition text-sm"
                >
                  View Responses
                </button>
              </div>
              <div className="text-sm text-gray-500">
                © {new Date().getFullYear()} Voice Survey Platform. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;