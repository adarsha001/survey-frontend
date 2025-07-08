import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import MySurveyResponses from './components/MySurveyResponses';
import QuestionDetailPage from './components/QuestionDetailPage';
import SurveyPage from './components/SurveyPage';
import SurveyForm from './SurveyForm';
import HomePage from './components/HomePage';
import Surveyresponse from './Surveyresponse';
import CreatorSurveysPage from './components/CreatorSurveysPage';
import EditSurveyPage from './components/EditSurveyPage';
import PublicRoute from './components/PublicRoute'; // 👈 import it
import NotFound from './components/NotFound';
import MarqueeWarning from './components/MarqueeWarning';

export default function App() {
  const handleQuizSubmit = (quizData) => {
    console.log('Submitted Quiz:', quizData);
  };

  return (
    <div>
      <Navbar />
      <MarqueeWarning/>
      <Routes>
        <Route path="/survey/edit/:id" element={<EditSurveyPage />} />
        <Route path="/surveys/:surveyId" element={<SurveyPage />} />
        <Route path="/surveys/:surveyId/question/:questionId" element={<QuestionDetailPage />} />
        
        {/* 👇 wrap login and register in PublicRoute */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route path="/response" element={<MySurveyResponses />} />
        <Route path="/surveyform" element={<SurveyForm onSubmit={handleQuizSubmit} />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/speech" element={<Surveyresponse />} />
        <Route path="/my-surveys" element={<CreatorSurveysPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
