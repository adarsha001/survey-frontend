// QuestionDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useAuth } from '../context/Auth';

const QuestionDetailPage = () => {
  const { surveyId, questionId } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [question, setQuestion] = useState(null);
  const [highlightedWords, setHighlightedWords] = useState([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [userResponse, setUserResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const res = await axios.get(`https://survey-backend-vugm.onrender.com/surveys/${surveyId}`);
        setSurvey(res.data);
        const foundQuestion = res.data.questions.find(q => q._id === questionId);
        setQuestion(foundQuestion);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching survey:', err.message);
        navigate('/');
      }
    };

    fetchSurvey();
  }, [surveyId, questionId, token, navigate]);

  useEffect(() => {
    if (!transcript || !question) return;

    const normalize = text =>
      text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();

    const spoken = normalize(transcript);
    const qText = normalize(question.questionText);
    const qWords = qText.split(' ');
    const matchedIndices = qWords.map((w, i) => (spoken.includes(w) ? i : -1)).filter(i => i !== -1);

    setHighlightedWords(matchedIndices);

    if (matchedIndices.length / qWords.length >= 0.8) {
      setIsUnlocked(true);
    }
  }, [transcript, question]);

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      resetTranscript();
    } else {
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const handleOptionSelect = (value) => {
    setUserResponse(value);
  };

  const renderQuestionText = () => {
    if (!question) return null;
    const words = question.questionText.split(' ');
    return words.map((word, i) => (
      <span
        key={i}
        className={`px-1 rounded ${highlightedWords.includes(i) ? 'bg-yellow-200' : ''}`}
      >
        {word}{' '}
      </span>
    ));
  };

  const renderOptions = () => {
    if (!question) return null;

    if (question.questionType === 'text') {
      return (
        <textarea
          rows={3}
          className="w-full p-2 border rounded border-gray-300"
          placeholder="Type your answer..."
          value={userResponse || ''}
          onChange={e => handleOptionSelect(e.target.value)}
        />
      );
    }

    return question.options.map((opt, idx) => {
      const isSelected = userResponse === opt;
      let base = 'p-2 border rounded mb-2 cursor-pointer transition ';
      let color = isSelected ? 'bg-blue-100 border-blue-400' : 'bg-white border-gray-300';

      return (
        <div
          key={idx}
          className={`${base} ${color}`}
          onClick={() => handleOptionSelect(opt)}
        >
          {opt}
        </div>
      );
    });
  };

  if (!browserSupportsSpeechRecognition) {
    return <div className="text-center text-red-600">Speech not supported.</div>;
  }

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!question) {
    return <div className="text-center text-red-600">Question not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Survey
      </button>

      <h1 className="text-xl font-bold mb-2">{survey?.title}</h1>

      <div className="text-center mb-6">
        <button
          onClick={toggleListening}
          className={`px-6 py-2 rounded text-white font-semibold transition ${listening ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {listening ? 'Stop Listening' : 'Start Listening'}
        </button>
        <div className="text-sm text-gray-500 mt-2">Speak the question to unlock</div>
      </div>

      <div className="p-4 mb-5 rounded border-l-4 border-blue-500 bg-gray-50">
        <div className="mb-2 font-medium text-gray-800 text-lg">
          {renderQuestionText()}
        </div>
        {isUnlocked ? (
          renderOptions()
        ) : (
          <div className="text-gray-500 italic">Speak to unlock</div>
        )}
      </div>
    </div>
  );
};

export default QuestionDetailPage;