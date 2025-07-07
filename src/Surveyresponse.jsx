import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/Auth';
import Login from './components/Login';

const Surveyresponse = () => {
  const [surveys, setSurveys] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, user, token } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        setLoading(true);
        const res = await axios.get('https://survey-backend-vugm.onrender.com/surveys', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSurveys(res.data.data);
        console.log(res.data.data)
      } catch (err) {
        console.error('Error fetching surveys:', err.message);
        setError('Failed to load surveys');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchSurveys();
    } else {
      setLoading(false);
    }
  }, [token, isAuthenticated]);
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center p-6 bg-gray-800 rounded-lg max-w-md">
          <h2 className="text-xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-gray-300 mb-4">Please login to view your surveys</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }



  const handleSurveyClick = (id) => {
    if (!isAuthenticated) return;
    navigate(`/surveys/${id}`);
  };

  const filteredSurveys = surveys.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.createdBy?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mb-4"></div>
          <p className="text-white text-lg font-medium">Loading surveys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Main Content */}
      <div className={`${!isAuthenticated ? 'blur-sm pointer-events-none select-none' : ''}`}>
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl mb-3">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
                Available Surveys
              </span>
            </h1>
            <p className="mt-3 text-xl text-gray-300">
              Browse and participate in available surveys
            </p>
          </div>


          <div className="mb-8">
            <input
              type="text"
              className="w-full max-w-2xl mx-auto p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
              placeholder="Search by title or creator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={!isAuthenticated}
            />
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-center">
              {error}
            </div>
          )}

          {filteredSurveys.length === 0 ? (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-8 text-center border border-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-white mb-2">
                {searchTerm ? 'No matching surveys found' : 'No surveys available'}
              </h3>
              <p className="text-gray-400">
                {searchTerm ? 'Try a different search term' : 'Check back later for new surveys'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSurveys.map((survey) => (
                <div
                  key={survey._id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-gray-700 transition-all hover:border-blue-400/30 hover:shadow-blue-400/10 cursor-pointer"
                  onClick={() => handleSurveyClick(survey._id)}
                >
                  {survey.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={survey.imageUrl}
                        alt="Survey Cover"
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-white mb-2">{survey.title}</h2>
                    <div className="flex items-center text-sm text-gray-400 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {survey.createdBy?.username || 'Unknown creator'}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {survey.questions.length} {survey.questions.length === 1 ? 'question' : 'questions'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Login Overlay */}
     
    </div>
  );
};

export default Surveyresponse;