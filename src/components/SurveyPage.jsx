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
  const [isRecording, setIsRecording] = useState(false);
  const [micPermission, setMicPermission] = useState('prompt'); // prompt, granted, denied
  const [audioLevel, setAudioLevel] = useState(0);
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const { token, isAuthenticated } = useAuth();

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicPermission('granted');
      return true;
    } catch (err) {
      console.error('Microphone permission denied:', err);
      setMicPermission('denied');
      
      let errorMessage = 'Microphone access is required for voice input. ';
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please grant microphone permission in your browser settings and refresh the page.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No microphone found on your device. Please connect a microphone and try again.';
      } else {
        errorMessage += 'Please check your microphone settings and try again.';
      }
      
      alert(errorMessage);
      return false;
    }
  };

  // Setup audio visualization
  const setupAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      sourceRef.current.connect(analyser);
      analyser.fftSize = 256;
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateLevel = () => {
        if (!isRecording) return;
        analyser.getByteTimeDomainData(dataArray);
        let max = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = (dataArray[i] - 128) / 128;
          max = Math.max(max, Math.abs(v));
        }
        setAudioLevel(max);
        requestAnimationFrame(updateLevel);
      };
      
      updateLevel();
    } catch (err) {
      console.error('Error setting up audio visualization:', err);
    }
  };

  const fetchSurvey = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`https://survey-backend-4gdj.onrender.com/surveys/${surveyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSurvey(res.data.data || res.data);
      console.log(res.data);
    } catch (err) {
      console.error('Error fetching survey:', err.message);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurvey();
  }, [surveyId, token, navigate]);

  useEffect(() => {
    if (!survey || !transcript) return;

    const normalize = (text) =>
      text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();

    const spoken = normalize(transcript);
    const spokenWords = spoken.split(' ');
    
    const unlocked = survey.questions.filter((q) => {
      const qText = normalize(q.questionText);
      const qWords = qText.split(' ');
      
      // Check for exact phrase match first
      if (spoken.includes(qText)) {
        return true;
      }
      
      // Then check for word matches with more flexible threshold
      let matchCount = 0;
      let totalWeight = 0;
      
      qWords.forEach(word => {
        // Ignore very short words
        if (word.length < 3) {
          totalWeight += 0.5;
          if (spokenWords.includes(word)) {
            matchCount += 0.5;
          }
        } else {
          totalWeight += 1;
          if (spokenWords.some(spokenWord => spokenWord.includes(word) || word.includes(spokenWord))) {
            matchCount += 1;
          }
        }
      });
      
      const matchPercentage = totalWeight > 0 ? matchCount / totalWeight : 0;
      return matchPercentage >= 0.6; // Flexible threshold
    });

    const unlockedIds = unlocked.map((q) => q._id);
    setUnlockedQuestions((prev) => [...new Set([...prev, ...unlockedIds])]);
  }, [transcript, survey]);

  const startRecording = async () => {
    // Check if microphone permission was already granted
    if (micPermission === 'denied') {
      alert('Microphone access is blocked. Please enable microphone access in your browser settings and refresh the page.');
      return;
    }
    
    // Request microphone permission
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) return;
    
    // Setup audio visualization
    await setupAudioVisualization();
    
    setIsRecording(true);
    isListeningRef.current = true;
    setTranscript('');
    setListening(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
    }
    setListening(false);
    
    // Clean up audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  useEffect(() => {
    if (!listening) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported on this browser. Please use Chrome, Edge, or Safari.');
      setListening(false);
      setIsRecording(false);
      isListeningRef.current = false;
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    let isRestarting = false;

    recognition.onstart = () => {
      console.log('Speech recognition started');
      isRestarting = false;
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptText = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptText + ' ';
        }
      }
      
      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
      }
    };

    recognition.onerror = (e) => {
      console.error('Speech Recognition Error:', e);
      
      switch(e.error) {
        case 'audio-capture':
          console.error('No microphone found or microphone not allowed');
          alert('Cannot access microphone. Please check your microphone connection and permissions.');
          stopRecording();
          break;
        case 'not-allowed':
          console.error('Microphone permission denied');
          alert('Microphone access was denied. Please allow microphone access in your browser settings and try again.');
          stopRecording();
          setMicPermission('denied');
          break;
        case 'no-speech':
          console.log('No speech detected - continuing to listen');
          // This is normal, don't do anything
          break;
        case 'network':
          console.error('Network error occurred');
          alert('Network error occurred. Please check your internet connection.');
          stopRecording();
          break;
        default:
          console.error('Speech recognition error:', e.error);
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      // Only restart if we're still supposed to be listening and not already restarting
      if (isListeningRef.current && !isRestarting) {
        isRestarting = true;
        setTimeout(() => {
          if (isListeningRef.current && listening) {
            try {
              recognition.start();
            } catch (err) {
              console.error('Restart error:', err);
              stopRecording();
            }
          }
          isRestarting = false;
        }, 100);
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Failed to start recognition:', err);
      stopRecording();
      alert('Failed to start speech recognition. Please try again.');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current = null;
        } catch (err) {
          console.error('Error stopping recognition:', err);
        }
      }
    };
  }, [listening]);

  const testMicrophone = async () => {
    const hasPermission = await requestMicrophonePermission();
    if (hasPermission) {
      alert('Microphone is working correctly! You can now use voice input.');
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
    // Check if all required intro questions are answered
    const missingRequiredIntro = survey.introQuestions?.some(
      q => q.required && !introResponses[q.questionText]
    );
    
    if (missingRequiredIntro) {
      alert('Please answer all required intro questions before submitting.');
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

    try {
      await axios.post('https://survey-backend-4gdj.onrender.com/surveys/survey-responses', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Responses submitted successfully!');
      navigate('/speech');
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('Submission failed. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center p-6 bg-gray-800 rounded-lg max-w-md">
          <h2 className="text-xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-gray-300 mb-4">Please login to view your surveys</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

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

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center p-6 bg-gray-800 rounded-lg max-w-md">
          <h2 className="text-xl font-bold text-white mb-4">Survey Not Found</h2>
          <p className="text-gray-300 mb-4">The survey you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Go Home
          </button>
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
          </div>
          
          <div className='pb-8'>
            <CopySurveyLink surveyId={survey._id} />
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

          {/* Voice Control Section */}
          <div className="mb-8 flex flex-col items-center">
            <div className="flex gap-4">
              <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                onMouseLeave={stopRecording}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  isRecording 
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                } shadow-lg`}
              >
                {isRecording ? (
                  <span className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    Recording... Release to stop
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    Hold to Speak
                  </span>
                )}
              </button>
              
              <button
                onClick={testMicrophone}
                className="px-4 py-3 rounded-lg font-semibold transition-all bg-gray-600 hover:bg-gray-700 shadow-lg"
                title="Test Microphone"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            
            {/* Audio Level Visualizer */}
            {isRecording && (
              <div className="mt-4 w-full">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-75"
                    style={{ width: `${audioLevel * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 text-center mt-1">
                  {audioLevel > 0.1 ? '🎤 Speaking detected...' : '🔇 Speak into your microphone'}
                </p>
              </div>
            )}
            
            {micPermission === 'denied' && (
              <div className="mt-4 p-3 bg-red-900/50 border border-red-600 rounded-lg">
                <p className="text-red-300 text-sm">
                  ⚠️ Microphone access is blocked. Please enable microphone access in your browser settings and refresh the page.
                </p>
              </div>
            )}
            
            {transcript && !isRecording && (
              <div className="mt-4 p-4 bg-gray-700/50 rounded-lg w-full">
                <p className="text-sm text-gray-300 mb-1">Last voice input:</p>
                <p className="text-blue-300 break-words">{transcript}</p>
              </div>
            )}
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
                      <h3 className="text-lg font-medium text-white leading-relaxed">
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
                        <p className="text-yellow-400 italic">🔊 Hold the microphone button and speak the question above to unlock it</p>
                        <p className="text-gray-400 text-sm mt-2">Say the exact words from the question</p>
                      </div>
                    ) : q.questionType === 'text' ? (
                      <textarea
                        rows={3}
                        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-white"
                        placeholder="Type your answer..."
                        value={responses[q._id] || ''}
                        onChange={(e) => handleOptionSelect(q._id, e.target.value, 'text')}
                      />
                    ) : (
                      <div className="space-y-2">
                        {q.options && q.options.map((opt, idx) => {
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
                              <div className="flex items-center gap-3">
                                {q.questionType === 'checkbox' && (
                                  <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={() => {}}
                                    className="w-4 h-4"
                                  />
                                )}
                                {q.questionType === 'radio' && (
                                  <input
                                    type="radio"
                                    checked={selected}
                                    onChange={() => {}}
                                    className="w-4 h-4"
                                  />
                                )}
                                <span>{opt}</span>
                              </div>
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
          <div className="flex justify-center pt-4">
            <button
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg text-white font-medium shadow-lg hover:shadow-blue-500/20 transition-all duration-200 transform hover:scale-105"
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