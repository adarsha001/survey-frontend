import React from 'react';
import QuizForm from './QuizForm';
import SpeechActivatedQA from './SpeechActivatedQA';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar'; // 👈 import navbar
import MySurveyResponses from './components/MySurveyResponses';
import QuestionDetailPage from './components/QuestionDetailPage';
import SurveyPage from './components/SurveyPage';
import SurveyForm from './SurveyForm';

export default function App() {
  const handleQuizSubmit = (quizData) => {
    console.log('Submitted Quiz:', quizData);
  };

  return (
    <div>
      <Navbar /> {/* 👈 add navbar */}
      <Routes>
      // Add this route to your existing routes
      <Route path="/surveys" element={<SpeechActivatedQA />} />
      <Route path="/surveys/:surveyId" element={<SurveyPage />} />
      <Route path="/surveys/:surveyId/question/:questionId" element={<QuestionDetailPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/response" element={<MySurveyResponses />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<SurveyForm onSubmit={handleQuizSubmit} />} />
        <Route path="/speech" element={<SpeechActivatedQA />} />
      </Routes>
    </div>
  );
}
