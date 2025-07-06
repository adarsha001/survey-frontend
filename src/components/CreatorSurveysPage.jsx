import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/Auth';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://survey-backend-vugm.onrender.com';

const CreatorSurveysPage = () => {
  const { token, isAuthenticated, user } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSurveys = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/surveys/created-by/me`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (res.data?.success && Array.isArray(res.data.data)) {
          setSurveys(res.data.data);
        } else {
          setSurveys([]);
          setError('Invalid response format from server');
        }
      } catch (err) {
        console.error('Failed to fetch creator surveys:', err);
        setError(err.response?.data?.message || 'Failed to load surveys');
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, [token, navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this survey? All responses will be permanently lost.')) {
      return;
    }
  
    try {
      setLoading(true);
      const response = await axios.delete(`${API_URL}/surveys/${id}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        validateStatus: (status) => status < 500 // Don't throw for 4xx errors
      });
  
      if (response.data?.success) {
        setSurveys(prev => prev.filter(s => s._id !== id));
        setError('');
      } else {
        setError(response.data?.message || 'Failed to delete survey');
      }
    } catch (err) {
      console.error('Error deleting survey:', err);
      
      let errorMessage = 'Failed to delete survey. Please try again.';
      if (err.response) {
        if (err.response.status === 403) {
          errorMessage = 'You are not authorized to delete this survey';
        } else if (err.response.status === 404) {
          errorMessage = 'Survey not found';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/survey/edit/${id}`);
  };

  const handleViewResponses = (id) => {
    navigate(`/response`);
  };

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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-white">Loading your surveys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-900 text-white max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Surveys</h1>
        <button
          onClick={() => navigate('/surveyform')}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
        >
          Create New Survey
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {surveys.length === 0 ? (
        <div className="bg-gray-800/50 p-8 rounded-lg text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-gray-500 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-white mb-2">No surveys found</h3>
          <p className="text-gray-400">You haven't created any surveys yet.</p>
          <button
            onClick={() => navigate('/surveyform')}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Create Your First Survey
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {surveys.map((survey) => (
            <div
              key={survey._id}
              className="p-6 border border-gray-700 rounded-lg bg-gray-800 hover:bg-gray-750 transition-colors"
            >
              <h2 className="text-xl font-semibold mb-2 truncate">{survey.title}</h2>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {survey.description || 'No description'}
              </p>
              
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                {survey.questions?.length || 0} questions
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleEdit(survey._id)}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white flex items-center justify-center gap-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => handleViewResponses(survey._id)}
                  className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm text-white flex items-center justify-center gap-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Responses
                </button>
                <button
                  onClick={() => handleDelete(survey._id)}
                  className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm text-white flex items-center justify-center gap-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreatorSurveysPage;