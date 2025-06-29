// src/pages/SurveyPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/auth';

const SurveyPage = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/surveys/${surveyId}`);
        setSurvey(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching survey:', err.message);
        setError('Failed to load survey');
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [surveyId, token]);

  const handleQuestionClick = (questionId) => {
    navigate(`/surveys/${surveyId}/question/${questionId}`);
  };

  if (loading) return <div className="text-center p-8">Loading survey...</div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;
  if (!survey) return <div className="text-center p-8">Survey not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button
        onClick={() => navigate('/surveys')} // FIXED
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Surveys
      </button>

      <h1 className="text-2xl font-bold mb-2">{survey.title}</h1>
      <p className="text-gray-600 mb-6">Created by: {survey.createdBy?.username || 'Unknown'}</p>

      <div className="space-y-4">
        {survey.questions.map((question) => (
          <div 
            key={question._id} 
            className="p-4 rounded border-l-4 border-gray-300 bg-white shadow cursor-pointer hover:border-blue-300 transition-colors"
            onClick={() => handleQuestionClick(question._id)}
          >
            <div className="font-medium text-gray-800 text-lg">
              {question.questionText}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Click to answer this question
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SurveyPage;
