// SurveyVoicePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/Auth';
import { 
  FaMicrophone, 
  FaStop, 
  FaVolumeUp, 
  FaCheckCircle, 
  FaLock, 
  FaUnlockAlt,
  FaArrowLeft,
  FaPaperPlane,
  FaSpinner,
  FaUserCheck,
  FaFileAlt,
  FaExclamationTriangle
} from 'react-icons/fa';

const SurveyVoicePage = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [responses, setResponses] = useState({});
  const [introResponses, setIntroResponses] = useState({});
  const [unlockedQuestions, setUnlockedQuestions] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentSpokenWord, setCurrentSpokenWord] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated || !token) {
      setAuthError(true);
      setLoading(false);
      // Redirect to login after 3 seconds
      const timer = setTimeout(() => {
        navigate('/login', { state: { from: `/survey/${surveyId}`, message: 'Please login to take this survey' } });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, token, navigate, surveyId]);

  useEffect(() => {
    // Only fetch survey if authenticated
    if (!isAuthenticated || !token) return;

    const fetchSurvey = async () => {
      try {
        const res = await axios.get(`https://survey-backend-4gdj.onrender.com/surveys/${surveyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSurvey(res.data.data || res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching survey:', err.message);
        if (err.response?.status === 401) {
          navigate('/login', { state: { from: `/survey/${surveyId}`, message: 'Session expired. Please login again.' } });
        } else {
          navigate('/');
        }
      }
    };
    fetchSurvey();
  }, [surveyId, token, navigate, isAuthenticated]);

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
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t + ' ';
          setCurrentSpokenWord(t);
          setTimeout(() => setCurrentSpokenWord(''), 2000);
        } else {
          interimTranscript += t;
        }
      }
      
      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
        // Simulate audio level for visual feedback
        setAudioLevel(Math.random() * 100);
        setTimeout(() => setAudioLevel(0), 500);
      }
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
    // Check authentication before submitting
    if (!isAuthenticated || !token) {
      navigate('/login', { state: { from: `/survey/${surveyId}`, message: 'Please login to submit your responses' } });
      return;
    }

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

    setSubmitting(true);
    try {
      await axios.post('https://survey-backend-4gdj.onrender.com/surveys/survey-responses', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Responses submitted successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error submitting survey:', error);
      if (error.response?.status === 401) {
        navigate('/login', { state: { from: `/survey/${surveyId}`, message: 'Session expired. Please login again.' } });
      } else {
        alert('Submission failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getProgress = () => {
    const totalQuestions = survey?.questions?.length || 1;
    const answeredQuestions = Object.keys(responses).length;
    return (answeredQuestions / totalQuestions) * 100;
  };

  // Loading state
  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
        <p className="text-white text-lg">Loading survey...</p>
      </div>
    </div>
  );

  // Authentication error state
  if (authError) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="bg-red-500/10 backdrop-blur-sm rounded-2xl p-8 border border-red-500/50 max-w-md text-center">
        <FaExclamationTriangle className="text-5xl text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-3">Authentication Required</h2>
        <p className="text-gray-300 mb-6">Please login to take this survey</p>
        <div className="space-y-3">
          <button
            onClick={() => navigate('/login', { state: { from: `/survey/${surveyId}` } })}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-200"
          >
            Go to Login
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all duration-200"
          >
            Back to Home
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-4">Redirecting to login in 3 seconds...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse [animation-delay:1s]"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <FaArrowLeft />
            Back to Home
          </button>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <h1 className="text-3xl font-bold text-white mb-2">{survey.title}</h1>
            <p className="text-gray-300">{survey.description}</p>
          </div>
        </div>

        {/* Voice Control Panel */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-blue-500/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <FaVolumeUp className="text-blue-400" />
                Voice Control
              </h3>
              <p className="text-sm text-gray-300">
                Speak questions aloud to unlock them. Your voice activates the survey!
              </p>
            </div>
            
            <button
              onClick={toggleListening}
              className={`relative px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                listening 
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              } text-white shadow-lg flex items-center gap-3`}
            >
              {listening ? (
                <>
                  <FaStop />
                  Stop Listening
                </>
              ) : (
                <>
                  <FaMicrophone />
                  Start Listening
                </>
              )}
            </button>
          </div>
          
          {/* Listening Indicator */}
          {listening && (
            <div className="mt-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping [animation-delay:0.4s]"></div>
                <span className="text-sm text-green-400 ml-2">Listening for your voice...</span>
              </div>
              
              {/* Audio Level Visualizer */}
              {audioLevel > 0 && (
                <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-100"
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
              )}
              
              {/* Current Spoken Word */}
              {currentSpokenWord && (
                <div className="mt-3 text-center">
                  <p className="text-sm text-blue-400">You said:</p>
                  <p className="text-white font-semibold">"{currentSpokenWord}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Survey Progress</span>
            <span>{Math.round(getProgress())}%</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        </div>

        {/* Intro Questions */}
        {survey.introQuestions?.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FaUserCheck className="text-blue-400" />
              Introduction
            </h2>
            <div className="space-y-4">
              {survey.introQuestions.map((q, idx) => (
                <div key={idx} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700">
                  <label className="block text-white font-medium mb-2">
                    {q.questionText}
                    {q.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  {q.fieldType === 'select' ? (
                    <select
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => handleIntroChange(q.questionText, e.target.value)}
                      required={q.required}
                    >
                      <option value="">Select an option...</option>
                      {q.options.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={q.fieldType || 'text'}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => handleIntroChange(q.questionText, e.target.value)}
                      required={q.required}
                      placeholder={`Enter your ${q.fieldType || 'answer'}...`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Survey Questions */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <FaFileAlt className="text-purple-400" />
            Survey Questions
          </h2>
          <div className="space-y-6">
            {survey.questions.map((q, index) => {
              const spokenWords = transcript.toLowerCase().split(' ');
              const words = q.questionText.split(' ');
              const selectedOptions = responses[q._id] || [];
              const isUnlocked = unlockedQuestions.includes(q._id);

              return (
                <div 
                  key={q._id} 
                  className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 ${
                    isUnlocked ? 'border-green-500/50 shadow-lg shadow-green-500/10' : 'border-gray-700'
                  }`}
                >
                  {/* Question Number */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">Question {index + 1}</span>
                    {isUnlocked ? (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <FaUnlockAlt size={12} />
                        Unlocked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-yellow-400">
                        <FaLock size={12} />
                        Locked
                      </span>
                    )}
                  </div>
                  
                  {/* Question Text with Highlighting */}
                  <div className="mb-4">
                    <p className="text-white text-lg font-medium leading-relaxed">
                      {words.map((word, idx) => {
                        const normalized = word.toLowerCase().replace(/[^a-z0-9]/g, '');
                        const isHighlighted = spokenWords.includes(normalized);
                        return (
                          <span 
                            key={idx} 
                            className={`inline-block px-1 rounded transition-all duration-200 ${
                              isHighlighted ? 'bg-yellow-500/30 text-yellow-200 scale-105' : ''
                            }`}
                          >
                            {word}{' '}
                          </span>
                        );
                      })}
                    </p>
                  </div>

                  {!isUnlocked ? (
                    <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 text-center">
                      <FaLock className="inline-block text-yellow-400 mr-2" />
                      <span className="text-yellow-400">Speak this question aloud to unlock it</span>
                    </div>
                  ) : q.questionType === 'text' ? (
                    <textarea
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                      placeholder="Type your answer here..."
                      value={responses[q._id] || ''}
                      onChange={(e) => handleOptionSelect(q._id, e.target.value, q.questionType)}
                    />
                  ) : (
                    <div className="space-y-2">
                      {q.options.map((opt, idx) => {
                        const isSelected = q.questionType === 'checkbox'
                          ? selectedOptions.includes(opt)
                          : responses[q._id] === opt;

                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-3 ${
                              isSelected
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md transform scale-[1.02]'
                                : 'bg-gray-900 border border-gray-700 text-gray-300 hover:bg-gray-700'
                            }`}
                            onClick={() => handleOptionSelect(q._id, opt, q.questionType)}
                          >
                            {isSelected && <FaCheckCircle className="text-white" />}
                            <span>{opt}</span>
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
        <div className="mt-10 text-center">
          <button
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <FaSpinner className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <FaPaperPlane />
                Submit Survey
              </>
            )}
          </button>
          
          {/* Response Count */}
          <p className="text-sm text-gray-500 mt-4">
            {Object.keys(responses).length} of {survey.questions.length} questions answered
          </p>
        </div>
      </div>
    </div>
  );
};

export default SurveyVoicePage;