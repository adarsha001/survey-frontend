import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/Auth'; // fixed relative path

const SpeechActivatedQA = () => {
  const [surveys, setSurveys] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useAuth();

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const res = await axios.get('http://localhost:5000/surveys', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Survey API response:', res.data);
        setSurveys(res.data.data); // Set surveys array
        setLoading(false);
      } catch (err) {
        console.error('Error fetching surveys:', err.message);
        setError('Failed to load surveys');
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchSurveys();
    }
  }, [token, isAuthenticated]);

  const handleSurveyClick = (surveyId) => {
    navigate(`/surveys/${surveyId}`);
  };

  const filteredSurveys = surveys.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.createdBy?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center p-8">Loading surveys...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="user-info mb-4">
        {user && <p>Welcome, {user.username} ({user.email})</p>}
      </div>

      <h1 className="text-2xl font-bold text-center mb-4">Available Surveys</h1>

      <input
        type="text"
        className="w-full p-2 border border-gray-300 rounded mb-6"
        placeholder="Search by title or creator..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {filteredSurveys.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          No surveys found. {searchTerm && 'Try a different search term.'}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredSurveys.map(survey => (
            <div
              key={survey._id}
              className="border rounded shadow cursor-pointer hover:border-blue-500 transition-colors bg-white"
              onClick={() => handleSurveyClick(survey._id)}
            >
              {/* Cover Image */}
              {survey.imageUrl && (
                <img
                  src={survey.imageUrl}
                  alt="Survey Cover"
                  className="w-full h-40 object-cover rounded-t"
                />
              )}

              <div className="p-4">
                <h2 className="text-lg font-semibold mb-1">{survey.title}</h2>
                <p className="text-sm text-gray-600 mb-1">
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
  );
};

export default SpeechActivatedQA;
