import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <h1 className="text-4xl font-bold text-white mb-4">🎤 Voice Survey Platform</h1>
      <p className="text-lg text-gray-300 max-w-xl text-center mb-8">
  Hi, I’m <span className="font-semibold text-blue-400">Adarsha</span> — a passionate full-stack web developer dedicated to building innovative solutions using modern technology.
  This voice-activated survey platform was built with love to make data collection more interactive and accessible.
</p>

<p className="text-md text-gray-300 max-w-xl text-center mb-8">
  This platform allows users to take surveys using their voice. Questions are "unlocked" only after you speak them out loud, ensuring active participation and preventing skimming.
  It's powered by modern speech recognition technology and designed to create a more immersive and accessible survey experience — ideal for education, research, and interactive feedback collection.
</p>

      <div className="flex flex-col md:flex-row gap-4">
        <button
          onClick={() => navigate('/surveyform')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 shadow"
        >
          ✍️ Create Survey
        </button>
        <button
          onClick={() => navigate('/response')}
          className="px-6 py-3 bg-white text-gray-900 rounded-lg text-lg hover:bg-gray-100 border border-gray-200 shadow"
        >
          📊 View Survey Responses
        </button>
      </div>

      <footer className="mt-12 text-sm text-gray-400">
        © {new Date().getFullYear()} Adarsha | Built with React & Voice Tech
      </footer>
    </div>
  );
};

export default HomePage;
