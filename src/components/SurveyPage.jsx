import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/Auth';
import CopySurveyLink from './CopySurveyLink';

const SurveyVoicePage = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState({});
  const [introResponses, setIntroResponses] = useState({});
  const [unlockedQuestions, setUnlockedQuestions] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const { token } = useAuth();

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`https://survey-backend-vugm.onrender.com/surveys/${surveyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSurvey(res.data.data || res.data);
        console.log(res.data)
      } catch (err) {
        console.error('Error fetching survey:', err.message);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchSurvey();
  }, [surveyId, token, navigate]);

  useEffect(() => {
    if (!survey || !transcript) return;

    const normalize = (text) =>
      text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();

    const spoken = normalize(transcript);

    const unlocked = survey.questions.filter((q) => {
      const qText = normalize(q.questionText);
      const qWords = qText.split(' ');
      const matchCount = qWords.filter((word) => spoken.includes(word)).length;
      return matchCount / qWords.length >= 0.8;
    });

    const unlockedIds = unlocked.map((q) => q._id);
    setUnlockedQuestions((prev) => [...new Set([...prev, ...unlockedIds])]);
  }, [transcript, survey]);

  useEffect(() => {
    if (!listening) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition not supported on this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t + ' ';
        }
      }
      setTranscript((prev) => prev + finalTranscript);
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (err) {
            console.error('Restart error:', err);
          }
        }, 300);
      }
    };

    recognition.onerror = (e) => {
      console.error('Speech Recognition Error:', e);
    };

    recognition.start();
    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [listening]);

  const toggleListening = () => {
    if (listening) {
      isListeningRef.current = false;
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      isListeningRef.current = true;
      setTranscript('');
      setListening(true);
    }
  };

  const handleOptionSelect = (questionId, value, type) => {
    setResponses((prev) => {
      if (type === 'checkbox') {
        const prevAnswers = prev[questionId] || [];
        if (prevAnswers.includes(value)) {
          return {
            ...prev,
            [questionId]: prevAnswers.filter((v) => v !== value),
          };
        } else {
          return {
            ...prev,
            [questionId]: [...prevAnswers, value],
          };
        }
      } else {
        return { ...prev, [questionId]: value };
      }
    });
  };

  const handleIntroChange = (key, value) => {
    setIntroResponses((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const payload = {
      introResponses: Object.entries(introResponses).map(([key, value]) => ({
        questionText: key,
        answer: value,
      })),
      responses: Object.entries(responses).map(([questionId, userAnswer]) => ({
        surveyId,
        questionId,
        userAnswer,
      })),
    };

    try {
      await axios.post('https://survey-backend-vugm.onrender.com/surveys/survey-responses', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Responses submitted successfully!');
      navigate('/surveys');
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('Submission failed.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mb-4"></div>
          <p className="text-white text-lg font-medium">Loading survey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-6 sm:p-8 border border-gray-700">
          {/* Survey Cover Image */}
          {survey.imageUrl && (
            <div className="w-full h-full flex justify-center mb-6">
              <img
                src={survey.imageUrl}
                alt="Survey cover"
                className="max-h-64 w-full object-cover rounded-lg shadow border border-gray-600"
              />
            </div>
          )}

          {/* Survey Title and Description */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">{survey.title}</h1>
            {survey.description && (
              <p className="text-gray-300">{survey.description}</p>
            )}
          </div >
<div className='pb-8'><CopySurveyLink surveyId={survey._id} /></div>
          {/* Voice Control Section */}
          <div className="mb-8 flex flex-col items-center">
            <button
              onClick={toggleListening}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                listening 
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' 
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
              } shadow-lg`}
            >
              {listening ? (
                <span className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  Stop Listening
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Start Listening
                </span>
              )}
            </button>
            {transcript && (
              <div className="mt-4 p-4 bg-gray-700/50 rounded-lg w-full">
                <p className="text-sm text-gray-300 mb-1">Voice input:</p>
                <p className="text-blue-300">{transcript}</p>
              </div>
            )}
          </div>

          {/* Intro Questions Section */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 pb-2 border-b border-gray-700">Intro Questions</h2>
            <div className="space-y-4">
              {survey.introQuestions?.map((q, idx) => (
                <div key={idx} className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                  <label className="block text-gray-300 mb-2 font-medium">
                    {q.questionText}
                    {q.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  <input
                    type={q.fieldType || 'text'}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-white"
                    onChange={(e) => handleIntroChange(q.questionText, e.target.value)}
                    required={q.required}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Survey Questions Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 pb-2 border-b border-gray-700">Survey Questions</h2>
            <div className="space-y-6">
              {survey.questions.map((q) => {
                const spokenWords = transcript.toLowerCase().split(' ');
                const words = q.questionText.split(' ');
                const selectedOptions = responses[q._id] || [];

                return (
                  <div 
                    key={q._id} 
                    className={`bg-gray-700/30 p-5 rounded-xl border transition-all ${
                      unlockedQuestions.includes(q._id) 
                        ? 'border-blue-500/30 hover:border-blue-500/50' 
                        : 'border-gray-600'
                    }`}
                  >
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-white">
                        {words.map((word, index) => {
                          const normalized = word.toLowerCase().replace(/[^a-z0-9]/g, '');
                          const isHighlighted = spokenWords.includes(normalized);
                          return (
                            <span 
                              key={index} 
                              className={`px-1 rounded transition-all ${
                                isHighlighted ? 'bg-yellow-400/80 text-gray-900' : ''
                              }`}
                            >
                              {word}{' '}
                            </span>
                          );
                        })}
                      </h3>
                    </div>

                    {!unlockedQuestions.includes(q._id) ? (
                      <div className="text-center py-4 bg-gray-800/50 rounded-lg">
                        <p className="text-yellow-400 italic">Speak the question to unlock</p>
                      </div>
                    ) : q.questionType === 'text' ? (
                      <textarea
                        rows={3}
                        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-white"
                        placeholder="Type your answer..."
                        value={responses[q._id] || ''}
                        onChange={(e) => handleOptionSelect(q._id, e.target.value)}
                      />
                    ) : (
                      <div className="space-y-2">
                        {q.options.map((opt, idx) => {
                          const selected = q.questionType === 'checkbox'
                            ? selectedOptions.includes(opt)
                            : responses[q._id] === opt;

                          return (
                            <div
                              key={idx}
                              className={`p-3 rounded-lg cursor-pointer transition-all ${
                                selected
                                  ? 'bg-blue-600 border-blue-400 text-white'
                                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                              } border`}
                              onClick={() => handleOptionSelect(q._id, opt, q.questionType)}
                            >
                              {opt}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg text-white font-medium shadow-lg hover:shadow-blue-500/20 transition-all"
              onClick={handleSubmit}
            >
              Submit Survey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyVoicePage;