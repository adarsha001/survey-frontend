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

    useEffect(() => {
      const fetchSurveys = async () => {
        try {
          const res = await axios.get('https://survey-backend-vugm.onrender.com/surveys', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setSurveys(res.data.data);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching surveys:', err.message);
          setError('Failed to load surveys');
          setLoading(false);
        }
      };

      if (isAuthenticated) {
        fetchSurveys();
      } else {
        setLoading(false); // stop loading even if not authenticated
      }
    }, [token, isAuthenticated]);

    const navigate = useNavigate();

    const handleSurveyClick = (id) => {
      if (!isAuthenticated) return;
      navigate(`/surveys/${id}`);
    };

    const filteredSurveys = surveys.filter((s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.createdBy?.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
      return <div className="text-center p-8 text-white">Loading surveys...</div>;
    }

    return (
      <div className="relative min-h-screen bg-gray-900 text-white">
        {/* Main Content */}
        <div className={`${!isAuthenticated ? 'blur-sm pointer-events-none select-none' : ''}`}>
          <div className="max-w-5xl mx-auto p-6">
            <div className="mb-4">
              {user && (
                <p className="text-sm text-gray-300">
                  Welcome, {user.username} ({user.email})
                </p>
              )}
            </div>

            <h1 className="text-3xl font-bold text-center mb-4">Available Surveys</h1>

            <input
              type="text"
              className="w-full p-2 rounded bg-gray-800 border border-gray-600 mb-6 text-white"
              placeholder="Search by title or creator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={!isAuthenticated}
            />

            {filteredSurveys.length === 0 ? (
              <div className="text-center text-gray-400">
                No surveys found. {searchTerm && 'Try a different search term.'}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredSurveys.map((survey) => (
                  <div
                    key={survey._id}
                    className="border border-gray-700 bg-gray-800 rounded shadow cursor-pointer hover:border-blue-500 transition-colors"
                    onClick={() => handleSurveyClick(survey._id)}
                  >
                    {survey.imageUrl && (
                      <img
                        src={survey.imageUrl}
                        alt="Survey Cover"
                        className="w-full h-40 object-cover rounded-t"
                      />
                    )}
                    <div className="p-4">
                      <h2 className="text-lg font-semibold">{survey.title}</h2>
                      <p className="text-sm text-gray-400">
                        Created by: {survey.createdBy?.username || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {survey.questions.length} questions
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Login Overlay */}
        {!isAuthenticated && (
          <div className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center z-10">
            <div className="mb-4 text-lg font-semibold text-white">
              Please log in to access surveys
            </div>
            <div className="w-full max-w-md">
              <Login />
            </div>
          </div>
        )}
      </div>
    );
  };

  export default Surveyresponse;
