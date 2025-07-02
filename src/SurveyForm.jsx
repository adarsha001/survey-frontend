import React, { useState } from 'react';
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
  const [optionError, setOptionError] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();

  const handleAddQuestion = () => {
    setQuestions([...questions, { questionText: '', questionType: 'radio', options: ['', ''] }]);
  };

  const handleAddIntroQuestion = () => {
    setIntroQuestions([...introQuestions, { questionText: '', fieldType: 'text', required: true, options: [] }]);
  };

  const handleTypeChange = (index, type) => {
    const newQuestions = [...questions];
    newQuestions[index].questionType = type;
    newQuestions[index].options = type === 'text' ? [] : ['', '', ...(type === 'checkbox' ? [''] : [])];
    setQuestions(newQuestions);
  };

  const handleIntroTypeChange = (index, type) => {
    const updated = [...introQuestions];
    updated[index].fieldType = type;
    if (type !== 'select') updated[index].options = [];
    setIntroQuestions(updated);
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

  const handleOptionDelete = (qIndex, oIndex) => {
    const updated = [...questions];
    const question = updated[qIndex];
    const min = question.questionType === 'radio' ? 2 : 3;
    if (question.options.length > min) {
      question.options.splice(oIndex, 1);
      setQuestions(updated);
      setOptionError('');
    } else {
      setOptionError(`At least ${min} options required for ${question.questionType} type`);
    }
  };

  const handleIntroOptionDelete = (qIndex, oIndex) => {
    const updated = [...introQuestions];
    updated[qIndex].options.splice(oIndex, 1);
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
          'Content-Type': 'multipart/form-data',
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
    <div className="min-h-screen w-full animate-gradient flex items-center justify-center text-white px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl bg-white/10 backdrop-blur-lg p-6 sm:p-8 rounded-xl shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Create Survey</h1>

        {error && <div className="text-red-400 mb-4">{error}</div>}
        {optionError && <div className="text-yellow-400 mb-4">{optionError}</div>}

        <input
          type="text"
          placeholder="Survey Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 sm:p-2 mb-4 rounded bg-gray-800 border border-gray-700 focus:outline-none"
          disabled={loading}
        />

        <textarea
          placeholder="Survey Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 sm:p-2 mb-4 rounded bg-gray-800 border border-gray-700 focus:outline-none"
          disabled={loading}
        />

        <label className="block mb-2 font-medium">Cover Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full mb-2"
          disabled={loading}
        />

        {image && (
          <div className="mb-6">
            <img
              src={URL.createObjectURL(image)}
              alt="Preview"
              className="w-full h-auto max-h-60 object-cover rounded shadow mb-2"
            />
            <button
              type="button"
              onClick={() => setImage(null)}
              className="text-sm text-red-500 hover:underline"
            >
              Remove Image
            </button>
          </div>
        )}

        {/* Intro Questions */}
        <h2 className="text-xl font-semibold mb-2">Intro Questions</h2>
        {introQuestions.map((q, idx) => (
          <div key={idx} className="mb-4 border border-gray-700 p-3 rounded bg-gray-800">
            <input
              type="text"
              placeholder="Question Text"
              value={q.questionText}
              onChange={(e) => {
                const updated = [...introQuestions];
                updated[idx].questionText = e.target.value;
                setIntroQuestions(updated);
              }}
              className="w-full p-2 mb-2 rounded bg-gray-900 border border-gray-600"
            />

            <select
              value={q.fieldType}
              onChange={(e) => handleIntroTypeChange(idx, e.target.value)}
              className="w-full p-2 mb-2 rounded bg-gray-900 border border-gray-600"
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
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                    <input
                      type="text"
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={(e) => handleIntroOptionChange(idx, i, e.target.value)}
                      className="w-full p-2 rounded bg-gray-900 border border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleIntroOptionDelete(idx, i)}
                      className="text-red-400 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {q.options.length < 5 && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...introQuestions];
                      updated[idx].options.push('');
                      setIntroQuestions(updated);
                    }}
                    className="text-blue-400 text-sm mt-1"
                  >
                    + Add Option
                  </button>
                )}
              </>
            )}

            <button
              type="button"
              className="text-red-500 text-sm mt-2"
              onClick={() => {
                const updated = [...introQuestions];
                updated.splice(idx, 1);
                setIntroQuestions(updated);
              }}
            >
              Delete Intro Question
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddIntroQuestion}
          className="mb-6 text-sm text-blue-400"
        >
          + Add Intro Question
        </button>

        {/* Main Questions */}
        <h2 className="text-xl font-semibold mb-2">Survey Questions</h2>
        {questions.map((q, idx) => (
          <div key={idx} className="mb-4 border border-gray-700 p-3 rounded bg-gray-800">
            <input
              type="text"
              placeholder="Question Text"
              value={q.questionText}
              onChange={(e) => {
                const updated = [...questions];
                updated[idx].questionText = e.target.value;
                setQuestions(updated);
              }}
              className="w-full p-2 mb-2 rounded bg-gray-900 border border-gray-600"
            />

            <select
              value={q.questionType}
              onChange={(e) => handleTypeChange(idx, e.target.value)}
              className="w-full p-2 mb-2 rounded bg-gray-900 border border-gray-600"
            >
              <option value="radio">Single Choice</option>
              <option value="checkbox">Multiple Choice</option>
              <option value="text">Text Answer</option>
            </select>

            {q.questionType !== 'text' && (
              <>
                {q.options.map((opt, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                    <input
                      type="text"
                      value={opt}
                      placeholder={`Option ${i + 1}`}
                      onChange={(e) => handleOptionChange(idx, i, e.target.value)}
                      className="w-full p-2 rounded bg-gray-900 border border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleOptionDelete(idx, i)}
                      className="text-red-400 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {q.options.length < 8 && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...questions];
                      updated[idx].options.push('');
                      setQuestions(updated);
                    }}
                    className="text-blue-400 text-sm mt-1"
                  >
                    + Add Option
                  </button>
                )}
              </>
            )}

            {idx > 0 && (
              <button
                type="button"
                onClick={() => {
                  const updated = [...questions];
                  updated.splice(idx, 1);
                  setQuestions(updated);
                }}
                className="text-red-500 text-sm mt-2"
              >
                Delete Question
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddQuestion}
          className="mb-6 text-sm text-blue-400"
        >
          + Add Survey Question
        </button>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Survey'}
        </button>
      </div>
    </div>
  );
}
