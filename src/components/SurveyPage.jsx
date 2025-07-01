import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useAuth } from '../context/auth';

const SurveyVoicePage = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState({});
  const [introResponses, setIntroResponses] = useState({});
  const [unlockedQuestions, setUnlockedQuestions] = useState([]);
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
        const res = await axios.get(`http://localhost:5000/surveys/${surveyId}`, {
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
    if (!transcript || !survey) return;
    console.log(transcript)
    console.log(transcript)
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

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      resetTranscript();
    } else {
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const handleOptionSelect = (questionId, value) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
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
      await axios.post('http://localhost:5000/surveys/survey-responses', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Responses submitted successfully!');
      navigate('/surveys');
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('Submission failed.');
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <div className="text-center text-red-600">Speech recognition not supported.</div>;
  }

  if (loading) {
    return <div className="text-center p-6">Loading survey...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{survey.title}</h1>
      <p className="text-gray-600 mb-4">{survey.description}</p>

      <button
        onClick={toggleListening}
        className={`mb-6 px-4 py-2 rounded text-white font-semibold ${listening ? 'bg-red-600' : 'bg-green-600'}`}
      >
        {listening ? 'Stop Listening' : 'Start Listening'}
      </button>

      {/* Intro Questions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Intro Questions</h2>
        {survey.introQuestions?.map((q, idx) => (
          <div key={idx} className="mb-4">
            <label className="block text-gray-700 mb-1">{q.questionText}</label>
            <input
              type={q.fieldType || 'text'}
              className="w-full p-2 border border-gray-300 rounded"
              onChange={(e) => handleIntroChange(q.questionText, e.target.value)}
              required={q.required}
            />
          </div>
        ))}
      </div>

      {/* Survey Questions */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Survey Questions</h2>
        {survey.questions.map((q) => {
          const renderQuestionTextWithHighlight = () => {
            const words = q.questionText.split(' ');
            const spokenWords = transcript.toLowerCase().split(' ');
            return words.map((word, index) => {
              const normalized = word.toLowerCase().replace(/[^a-z0-9]/g, '');
              const isHighlighted = spokenWords.includes(normalized);
              return (
                <span
                  key={index}
                  className={`px-1 rounded ${isHighlighted ? 'bg-yellow-300' : ''}`}
                >
                  {word}{' '}
                </span>
              );
            });
          };

          return (
            <div key={q._id} className="mb-6 p-4 border rounded shadow">
              <div className="mb-2 font-medium text-gray-800 text-lg">
                {renderQuestionTextWithHighlight()}
              </div>

              {!unlockedQuestions.includes(q._id) ? (
                <div className="italic text-gray-400">Speak the question to unlock</div>
              ) : q.questionType === 'text' ? (
                <textarea
                  rows={3}
                  className="w-full p-2 border rounded border-gray-300"
                  placeholder="Type your answer..."
                  value={responses[q._id] || ''}
                  onChange={(e) => handleOptionSelect(q._id, e.target.value)}
                />
              ) : (
                q.options.map((opt, idx) => {
                  const selected = responses[q._id] === opt;
                  return (
                    <div
                      key={idx}
                      className={`p-2 border rounded mb-2 cursor-pointer ${
                        selected ? 'bg-blue-100 border-blue-400' : 'border-gray-300 bg-white'
                      }`}
                      onClick={() => handleOptionSelect(q._id, opt)}
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
  );
};

export default SurveyVoicePage;
