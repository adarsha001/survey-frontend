import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './context/Auth';

const API_URL = 'https://survey-backend-vugm.onrender.com';

export default function SurveyForm({ mode = 'create' }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: '', questionType: 'radio', options: ['', ''] }
  ]);
  const [introQuestions, setIntroQuestions] = useState([
    { questionText: '', fieldType: 'text', required: true, options: [] }
  ]);
  const [image, setImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [optionError, setOptionError] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const { id } = useParams();

  const handleAddQuestion = () => {
    setQuestions([...questions, { questionText: '', questionType: 'radio', options: ['', ''] }]);
  };

const handleAddIntroQuestion = () => {
  setIntroQuestions(prev => [
    ...prev,
    { questionText: '', fieldType: 'text', required: true, options: [] }
  ]);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setImagePreviewUrl(URL.createObjectURL(file));
  };

  useEffect(() => {
    const fetchSurvey = async () => {
      if (mode !== 'edit' || !id) return;
      try {
        console.log('mode:', mode, 'id:', id);
        const res = await axios.get(`${API_URL}/surveys/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data
        console.log(res.data)
        if (data) {
          setTitle(data.title || '');
          setDescription(data.description || '');
          setQuestions(data.questions || []);
          setIntroQuestions(data.introQuestions || []);
          if (data.imageUrl) setImagePreviewUrl(data.imageUrl || data.mediaUrl || '');
        }
      } catch (err) {
        console.error('Failed to load survey for edit:', err);
        setError('Failed to load survey data');
      }
    };
    fetchSurvey();
  }, [mode, id, token]);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setError('Please login to proceed');
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

      if (mode === 'edit' && id) {
        await axios.put(`${API_URL}/surveys/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        navigate('/my-surveys');
      } else {
        await axios.post(`${API_URL}/surveys/create-survey`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        navigate('/speech');
      }
    } catch (err) {
      console.error('Survey submit failed:', err);
      setError(err.response?.data?.message || 'Failed to submit survey');
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const heading = mode === 'edit' ? 'Edit Survey' : 'Create New Survey';
  const buttonLabel = loading ? (mode === 'edit' ? 'Updating...' : 'Creating...') : (mode === 'edit' ? 'Update Survey' : 'Create Survey');

  // ... rest of your form rendering code remains unchanged ...
  // Use `heading` and `buttonLabel` in your JSX for title and button


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
              Create New Survey
            </span>
          </h1>
          <p className="text-gray-300">Build your custom survey with multiple question types</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-6 sm:p-8 border border-gray-700">
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
              {error}
            </div>
          )}
          {optionError && (
            <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-300">
              {optionError}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-gray-300 mb-2 font-medium">Survey Title</label>
            <input
              type="text"
              placeholder="Enter survey title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-white placeholder-gray-400"
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 mb-2 font-medium">Description (Optional)</label>
            <textarea
              placeholder="Describe your survey"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition min-h-[100px] text-white placeholder-gray-400"
              disabled={loading}
            />
          </div>

          {/* Improved Image Upload Section */}
          <div className="mb-6">
            <label className="block text-gray-300 mb-2 font-medium">Cover Image (Optional)</label>
            <div className="flex flex-col gap-4">
              <label className="cursor-pointer">
                <div className="p-8 rounded-lg bg-gray-700/50 border-2 border-dashed border-gray-600 hover:border-blue-500 transition flex flex-col items-center justify-center gap-2 text-center">
                  {image ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-blue-400 font-medium">{image.name}</p>
                      <p className="text-sm text-gray-400">Click to change image</p>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-gray-300 font-medium">Upload a cover image</p>
                      <p className="text-sm text-gray-400">Drag & drop or click to browse</p>
                      <p className="text-xs text-gray-500">Recommended size: 1200x600px</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={loading}
                />
              </label>
              
              {image && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="px-4 py-2 bg-red-900/50 border border-red-700 rounded-lg text-red-400 hover:bg-red-800/30 transition flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove Image
                  </button>
                </div>
              )}
            </div>
            
            {image && (
              <div className="mt-6">
                <h3 className="text-gray-300 mb-2 font-medium">Image Preview</h3>
                <div className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    className="w-full h-auto max-h-80 object-contain rounded-lg shadow border border-gray-600"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-lg">Preview</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Intro Questions Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-300">Intro Questions</h2>
              <button
                type="button"
                onClick={handleAddIntroQuestion}
                className="px-3 py-1 bg-blue-900/30 border border-blue-700 rounded-lg text-blue-400 hover:bg-blue-800/30 transition text-sm flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Question
              </button>
            </div>

            {introQuestions.map((q, idx) => (
              <div key={idx} className="mb-6 p-5 rounded-lg bg-gray-700/50 border border-gray-600">
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2 font-medium">Question Text</label>
                  <input
                    type="text"
                    placeholder="Enter question"
                    value={q.questionText}
                    onChange={(e) => {
                      const updated = [...introQuestions];
                      updated[idx].questionText = e.target.value;
                      setIntroQuestions(updated);
                    }}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-white placeholder-gray-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-300 mb-2 font-medium">Response Type</label>
                  <select
                    value={q.fieldType}
                    onChange={(e) => handleIntroTypeChange(idx, e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-white"
                  >
                    <option value="text" className="bg-gray-800">Text</option>
                    <option value="number" className="bg-gray-800">Number</option>
                    <option value="email" className="bg-gray-800">Email</option>
                    <option value="date" className="bg-gray-800">Date</option>
                    <option value="select" className="bg-gray-800">Dropdown</option>
                  </select>
                </div>

                {q.fieldType === 'select' && (
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2 font-medium">Dropdown Options</label>
                    <div className="space-y-2">
                      {q.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder={`Option ${i + 1}`}
                            value={opt}
                            onChange={(e) => handleIntroOptionChange(idx, i, e.target.value)}
                            className="flex-1 p-2 rounded bg-gray-800 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-white placeholder-gray-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleIntroOptionDelete(idx, i)}
                            className="p-2 text-red-400 hover:text-red-300 transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
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
                          className="text-blue-400 hover:text-blue-300 text-sm mt-1 flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Option
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) => {
                        const updated = [...introQuestions];
                        updated[idx].required = e.target.checked;
                        setIntroQuestions(updated);
                      }}
                      className="rounded bg-gray-800 border-gray-600 text-blue-500 focus:ring-blue-500"
                    />
                    Required
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...introQuestions];
                      updated.splice(idx, 1);
                      setIntroQuestions(updated);
                    }}
                    className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Question
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Main Questions Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-300">Survey Questions</h2>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3 py-1 bg-blue-900/30 border border-blue-700 rounded-lg text-blue-400 hover:bg-blue-800/30 transition text-sm flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Question
              </button>
            </div>

            {questions.map((q, idx) => (
              <div key={idx} className="mb-6 p-5 rounded-lg bg-gray-700/50 border border-gray-600">
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2 font-medium">Question Text</label>
                  <input
                    type="text"
                    placeholder="Enter question"
                    value={q.questionText}
                    onChange={(e) => {
                      const updated = [...questions];
                      updated[idx].questionText = e.target.value;
                      setQuestions(updated);
                    }}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-white placeholder-gray-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-300 mb-2 font-medium">Question Type</label>
                  <select
                    value={q.questionType}
                    onChange={(e) => handleTypeChange(idx, e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-white"
                  >
                    <option value="radio" className="bg-gray-800">Single Choice</option>
                    <option value="checkbox" className="bg-gray-800">Multiple Choice</option>
                    <option value="text" className="bg-gray-800">Text Answer</option>
                  </select>
                </div>

                {q.questionType !== 'text' && (
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2 font-medium">Options</label>
                    <div className="space-y-2">
                      {q.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder={`Option ${i + 1}`}
                            value={opt}
                            onChange={(e) => handleOptionChange(idx, i, e.target.value)}
                            className="flex-1 p-2 rounded bg-gray-800 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-white placeholder-gray-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleOptionDelete(idx, i)}
                            className="p-2 text-red-400 hover:text-red-300 transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
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
                          className="text-blue-400 hover:text-blue-300 text-sm mt-1 flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Option
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {idx > 0 && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...questions];
                        updated.splice(idx, 1);
                        setQuestions(updated);
                      }}
                      className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Question
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg text-white font-medium shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Survey...
                </span>
              ) : (
                'Create Survey'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}