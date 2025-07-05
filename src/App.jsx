import React from 'react';
// import QuizForm from './QuizForm';
// import SpeechActivatedQA from './SpeechActivatedQA';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar'; // 👈 import navbar
import MySurveyResponses from './components/MySurveyResponses';
import QuestionDetailPage from './components/QuestionDetailPage';
import SurveyPage from './components/SurveyPage';
import SurveyForm from './SurveyForm';
import HomePage from './components/HomePage';
import Surveyresponse from './Surveyresponse';
import CreatorSurveysPage from './components/CreatorSurveysPage';
import EditSurveyPage from './components/EditSurveyPage';

export default function App() {
  const handleQuizSubmit = (quizData) => {
    console.log('Submitted Quiz:', quizData);
  };

  return (
    <div>
      <Navbar /> {/* 👈 add navbar */}
      <Routes>
      <Route path="/survey/edit/:id" element={<EditSurveyPage />} />
      // Add this route to your existing routes
      {/* <Route path="/surveys" element={<SpeechActivatedQA />} /> */}
      <Route path="/surveys/:surveyId" element={<SurveyPage />} />
      <Route path="/surveys/:surveyId/question/:questionId" element={<QuestionDetailPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/response" element={<MySurveyResponses />} />
        <Route path="/register" element={<Register />} />
        <Route path="/surveyform" element={<SurveyForm onSubmit={handleQuizSubmit} />} />
        <Route path="/" element={<HomePage/>} />
        <Route path="/speech" element={<Surveyresponse />} />
        <Route path="/my-surveys" element={<CreatorSurveysPage />} />
      </Routes>
    </div>
  );
}
