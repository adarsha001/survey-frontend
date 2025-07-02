import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/Auth';

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
        const res = await axios.get(`https://survey-backend-vugm.onrender.com/surveys/${surveyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSurvey(res.data.data || res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching survey:', err.message);
        navigate('/');
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

  if (loading) return <div className="text-center p-6">Loading survey...</div>;

  return (
    <div className="min-h-screen w-full animate-gradient flex items-center justify-center text-white px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl bg-white/10 backdrop-blur-lg p-6 sm:p-8 rounded-xl shadow-xl">
        <h1 className="text-2xl font-bold mb-2">{survey.title}</h1>
        <p className="text-white mb-4">{survey.description}</p>

        <button
          onClick={toggleListening}
          className={`mb-6 px-4 py-2 rounded text-white font-semibold ${listening ? 'bg-red-600' : 'bg-green-600'}`}
        >
          {listening ? 'Stop Listening' : 'Start Listening'}
        </button>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Intro Questions</h2>
          {survey.introQuestions?.map((q, idx) => (
            <div key={idx} className="mb-4">
              <label className="block text-white mb-1">{q.questionText}</label>
              <input
                type={q.fieldType || 'text'}
                className="w-full p-2 border border-gray-300 rounded"
                onChange={(e) => handleIntroChange(q.questionText, e.target.value)}
                required={q.required}
              />
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Survey Questions</h2>
          {survey.questions.map((q) => {
            const spokenWords = transcript.toLowerCase().split(' ');
            const words = q.questionText.split(' ');
            const selectedOptions = responses[q._id] || [];

            return (
              <div key={q._id} className="mb-6 p-4 border rounded shadow">
                <div className="mb-2 font-medium text-white text-lg">
                  {words.map((word, index) => {
                    const normalized = word.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const isHighlighted = spokenWords.includes(normalized);
                    return (
                      <span key={index} className={`px-1 rounded ${isHighlighted ? 'bg-yellow-400' : ''}`}>{word} </span>
                    );
                  })}
                </div>

                {!unlockedQuestions.includes(q._id) ? (
                  <div className="italic text-yellow">Speak the question to unlock</div>
                ) : q.questionType === 'text' ? (
                  <textarea
                    rows={3}
                    className="w-full p-2 border rounded border-black text-black"
                    placeholder="Type your answer..."
                    value={responses[q._id] || ''}
                    onChange={(e) => handleOptionSelect(q._id, e.target.value)}
                  />
                ) : (
                  q.options.map((opt, idx) => {
                    const selected = q.questionType === 'checkbox'
                      ? selectedOptions.includes(opt)
                      : responses[q._id] === opt;

                    return (
                      <div
                        key={idx}
                        className={`p-2 border rounded mb-2 cursor-pointer ${
                          selected ? 'bg-green-700 border-blue-400' : 'border-gray-300 bg-white font-black text-stone-900'
                        }`}
                        onClick={() => handleOptionSelect(q._id, opt, q.questionType)}
                      >
                        {opt}
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>

        <button
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleSubmit}
        >
          Submit Survey
        </button>
      </div>
    </div>
  );
};

export default SurveyVoicePage;
