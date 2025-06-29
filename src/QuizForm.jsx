import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/auth';

const API_URL = 'http://localhost:5000';

export default function SurveyForm() {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: '', questionType: 'radio', options: ['', ''] }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const { isAuthenticated, user, token } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const addQuestion = () => {
    setQuestions([...questions, {
      questionText: '',
      questionType: 'radio',
      options: ['', '']
    }]);
    setDropdownOpen(false);
  };

  const handleTypeChange = (qIndex, type) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].questionType = type;
    newQuestions[qIndex].options = type === 'text' ? [] : ['', ''];
    setQuestions(newQuestions);
  };

  const addOption = (qIndex) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options.length >= 4) return;
    newQuestions[qIndex].options.push('');
    setQuestions(newQuestions);
  };

  const removeOption = (qIndex, optIndex) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options.length <= 2) return;
    newQuestions[qIndex].options.splice(optIndex, 1);
    setQuestions(newQuestions);
  };

  const removeQuestion = (qIndex) => {
    if (questions.length <= 1) return;
    const newQuestions = [...questions];
    newQuestions.splice(qIndex, 1);
    setQuestions(newQuestions);
    setDropdownOpen(false);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[optIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setError('Please login to create surveys');
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/surveys`, {
        title,
        questions,
        createdBy: user.userId
      });

      navigate('/speech');
    } catch (err) {
      console.error('Survey creation failed:', err);
      setError(err.response?.data?.message || 'Failed to create survey');
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="survey-form p-4 max-w-4xl mx-auto">
      <div className="user-info mb-4 p-2 bg-gray-100 rounded-lg">
        {user && <p className="text-sm text-gray-700">Welcome, {user.username} ({user.email})</p>}
      </div>

      {error && <div className="error-message p-3 mb-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      <div className="form-group mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Survey Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={loading}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
        />
      </div>

      {questions.map((q, qIndex) => (
        <div key={qIndex} className="question-block mb-8 p-4 bg-white rounded-lg shadow-sm border border-gray-200 relative">
          <div className="absolute top-2 right-2" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </button>
            
            {/* Dropdown menu with smooth animation */}
            <div className={`absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 origin-top-right transition-all duration-200 ease-in-out ${dropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
              <div className="py-1">
                <button
                  onClick={() => removeQuestion(qIndex)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
                  disabled={questions.length <= 1 || loading}
                >
                  Remove Question
                </button>
                <button
                  onClick={addQuestion}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
                  disabled={loading}
                >
                  Add Question Below
                </button>
              </div>
            </div>
          </div>

          <div className="form-group mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Question {qIndex + 1}</label>
            <input
              type="text"
              value={q.questionText}
              onChange={(e) => {
                const newQuestions = [...questions];
                newQuestions[qIndex].questionText = e.target.value;
                setQuestions(newQuestions);
              }}
              required
              disabled={loading}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            />
          </div>

          <div className="form-group mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
            <select
              value={q.questionType}
              onChange={(e) => handleTypeChange(qIndex, e.target.value)}
              disabled={loading}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="radio">Single Choice</option>
              <option value="checkbox">Multiple Choice</option>
              <option value="text">Text Answer</option>
            </select>
          </div>

          {q.questionType !== 'text' && (
            <div className="options-container">
              <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
              {q.options.map((opt, optIndex) => (
                <div key={optIndex} className="option-row flex items-center mb-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                    required
                    disabled={loading}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  />
                  {q.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(qIndex, optIndex)}
                      className="remove-btn ml-2 p-1 text-red-500 hover:text-red-700 disabled:opacity-50"
                      disabled={loading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              {q.options.length < 4 && (
                <button
                  type="button"
                  onClick={() => addOption(qIndex)}
                  className="add-option-btn mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  disabled={loading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Option
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      <div className="form-actions flex flex-col sm:flex-row gap-3 mt-6">
        <button
          type="button"
          onClick={addQuestion}
          className="add-question-btn flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50"
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Question
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="submit-btn px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Survey...
            </span>
          ) : 'Create Survey'}
        </button>
      </div>
    </div>
  );
}