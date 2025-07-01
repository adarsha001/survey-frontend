import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/Auth';

const API_URL = 'http://localhost:5000';

export default function SurveyForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: '', questionType: 'radio', options: ['', ''] }
  ]);
  const [introQuestions, setIntroQuestions] = useState([
    { questionText: '', fieldType: 'text', required: true, options: [] }
  ]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useAuth();

  const handleAddQuestion = () => {
    setQuestions([...questions, {
      questionText: '',
      questionType: 'radio',
      options: ['', '']
    }]);
  };

  const handleAddIntroQuestion = () => {
    setIntroQuestions([...introQuestions, {
      questionText: '',
      fieldType: 'text',
      required: true,
      options: []
    }]);
  };

  const handleTypeChange = (index, type) => {
    const newQuestions = [...questions];
    newQuestions[index].questionType = type;
    newQuestions[index].options = type === 'text' ? [] : ['', ''];
    setQuestions(newQuestions);
  };

  const handleIntroTypeChange = (index, type) => {
    const newIntro = [...introQuestions];
    newIntro[index].fieldType = type;
    if (type !== 'select') newIntro[index].options = [];
    setIntroQuestions(newIntro);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleIntroOptionChange = (qIndex, oIndex, value) => {
    const updated = [...introQuestions];
    updated[qIndex].options[oIndex] = value;
    setIntroQuestions(updated);
  };

  const handleImageChange = (e) => setImage(e.target.files[0]);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setError('Please login to create surveys');
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('questions', JSON.stringify(questions));
      formData.append('introQuestions', JSON.stringify(introQuestions));
      if (image) formData.append('image', image);

      await axios.post(`${API_URL}/surveys/create-survey`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
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
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Create Survey</h1>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <input
        type="text"
        placeholder="Survey Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 mb-4 border border-gray-300 rounded"
        disabled={loading}
      />

      <textarea
        placeholder="Survey Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 mb-4 border border-gray-300 rounded"
        disabled={loading}
      />

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="w-full mb-6"
        disabled={loading}
      />

      {/* Intro Questions */}
      <h2 className="text-lg font-semibold mb-2">Intro Questions</h2>
      {introQuestions.map((q, idx) => (
        <div key={idx} className="mb-4 border p-3 rounded bg-gray-50">
          <input
            type="text"
            placeholder="Question Text"
            value={q.questionText}
            onChange={(e) => {
              const newIntro = [...introQuestions];
              newIntro[idx].questionText = e.target.value;
              setIntroQuestions(newIntro);
            }}
            className="w-full p-2 mb-2 border border-gray-300 rounded"
          />
          <select
            value={q.fieldType}
            onChange={(e) => handleIntroTypeChange(idx, e.target.value)}
            className="w-full p-2 mb-2 border border-gray-300 rounded"
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="email">Email</option>
            <option value="date">Date</option>
            <option value="select">Dropdown</option>
          </select>

          {q.fieldType === 'select' && (
            <>
              {q.options.map((opt, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => handleIntroOptionChange(idx, i, e.target.value)}
                  className="w-full p-2 mb-1 border border-gray-300 rounded"
                />
              ))}
              {q.options.length < 5 && (
                <button
                  type="button"
                  className="text-blue-600 text-sm"
                  onClick={() => {
                    const newIntro = [...introQuestions];
                    newIntro[idx].options.push('');
                    setIntroQuestions(newIntro);
                  }}
                >
                  + Add Option
                </button>
              )}
            </>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddIntroQuestion}
        className="mb-6 text-sm text-blue-600"
      >
        + Add Intro Question
      </button>

      {/* Main Questions */}
      <h2 className="text-lg font-semibold mb-2">Survey Questions</h2>
      {questions.map((q, idx) => (
        <div key={idx} className="mb-4 border p-3 rounded">
          <input
            type="text"
            placeholder="Question Text"
            value={q.questionText}
            onChange={(e) => {
              const updated = [...questions];
              updated[idx].questionText = e.target.value;
              setQuestions(updated);
            }}
            className="w-full p-2 mb-2 border border-gray-300 rounded"
          />
          <select
            value={q.questionType}
            onChange={(e) => handleTypeChange(idx, e.target.value)}
            className="w-full p-2 mb-2 border border-gray-300 rounded"
          >
            <option value="radio">Single Choice</option>
            <option value="checkbox">Multiple Choice</option>
            <option value="text">Text Answer</option>
          </select>

          {q.questionType !== 'text' && (
            <>
              {q.options.map((opt, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, i, e.target.value)}
                  className="w-full p-2 mb-1 border border-gray-300 rounded"
                />
              ))}
              {q.options.length < 4 && (
                <button
                  type="button"
                  className="text-blue-600 text-sm"
                  onClick={() => {
                    const updated = [...questions];
                    updated[idx].options.push('');
                    setQuestions(updated);
                  }}
                >
                  + Add Option
                </button>
              )}
            </>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddQuestion}
        className="mb-6 text-sm text-blue-600"
      >
        + Add Survey Question
      </button>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create Survey'}
      </button>
    </div>
  );
}
