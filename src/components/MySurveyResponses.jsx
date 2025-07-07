import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/Auth';
import SurveyStatsWithNames from './SurveyStats';
import { useNavigate } from 'react-router-dom';

const MySurveyResponses = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token,isAuthenticated } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchResponses = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          'https://survey-backend-vugm.onrender.com/surveys/all-responses',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setResponses(res.data.data || []);
      } catch (err) {
        setError('Failed to fetch responses. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchResponses();
  }, [token]);
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


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mb-4"></div>
          <p className="text-white text-lg font-medium">Loading your survey responses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="bg-gray-800/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-gray-700 max-w-md w-full text-center">
          <div className="text-red-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Data</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl mb-3">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
              My Survey Responses
            </span>
          </h1>
          <p className="mt-3 text-xl text-gray-300">
            View all responses submitted to your surveys
          </p>
        </div>

        {responses.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-8 text-center border border-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">No responses yet</h3>
            <p className="text-gray-400">Your surveys haven't received any responses yet. Check back later.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {responses.map((resp, idx) => (
              <div
                key={idx}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-700 transition-all hover:border-blue-400/30 hover:shadow-blue-400/10"
              >
                <div className="p-6 sm:p-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-white mb-1">
                        {resp.user?.username || 'Anonymous User'}
                      </h2>
                      <p className="text-sm text-gray-400 mb-3">
                        {resp.user?.email || 'No email provided'}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-800">
                      {new Date(resp.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Intro Responses Section */}
                  {Array.isArray(resp.introResponses) && resp.introResponses.length > 0 && (
                    <div className="mt-6 mb-6">
                      <h3 className="text-md font-semibold text-gray-300 mb-3 pb-2 border-b border-gray-700">
                        Introductory Questions
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {resp.introResponses.map((iq, i) => (
                          <div key={i} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                            <p className="text-sm font-medium text-gray-400 mb-1">{iq.questionText}</p>
                            <p className="text-blue-300 font-medium">{iq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Survey Questions Section */}
                  <div className="mt-6">
                    <h3 className="text-md font-semibold text-gray-300 mb-4 pb-2 border-b border-gray-700">
                      Survey Responses
                    </h3>
                    <div className="space-y-6">
                      {resp.responses.map((r, i) => (
                        <div key={i} className="pl-4 border-l-4 border-blue-500/50">
                          <div className="text-sm font-medium text-gray-500 mb-1">{r.surveyTitle}</div>
                          <h4 className="text-base font-semibold text-white mb-2">{r.questionText}</h4>
                          <div className="bg-blue-900/20 px-4 py-3 rounded-lg border border-blue-800/30">
                            <p className="text-blue-300 font-medium">
                              {Array.isArray(r.userAnswer) ? r.userAnswer.join(', ') : r.userAnswer}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16">
          <SurveyStatsWithNames />
        </div>
      </div>
    </div>
  );
};

export default MySurveyResponses;