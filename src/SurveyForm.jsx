import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from './context/auth';

const SurveyForm = () => {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [introQuestions, setIntroQuestions] = useState([]);

  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', questionType: 'text', options: [] }]);
  };

  const addIntroQuestion = () => {
    setIntroQuestions([...introQuestions, { questionText: '', fieldType: 'text' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/surveys', {
        title,
        description,
        questions,
        introQuestions
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert('Survey created successfully!');
    } catch (err) {
      console.error("Error creating survey:", err);
      alert("Failed to create survey.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Create Survey</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border" placeholder="Title" required />
        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border" placeholder="Description" />

        <h3 className="font-semibold mt-4">Intro Questions</h3>
        {introQuestions.map((q, i) => (
          <div key={i} className="border p-2 mb-2">
            <input value={q.questionText} onChange={e => {
              const updated = [...introQuestions];
              updated[i].questionText = e.target.value;
              setIntroQuestions(updated);
            }} className="w-full p-1 mb-2 border" placeholder="Field label" />
            <select value={q.fieldType} onChange={e => {
              const updated = [...introQuestions];
              updated[i].fieldType = e.target.value;
              setIntroQuestions(updated);
            }} className="w-full p-1 border">
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="email">Email</option>
              <option value="date">Date</option>
              <option value="select">Select</option>
            </select>
          </div>
        ))}
        <button type="button" onClick={addIntroQuestion} className="bg-green-600 text-white px-4 py-2 rounded">Add Intro Question</button>

        <h3 className="font-semibold mt-4">Survey Questions</h3>
        {questions.map((q, i) => (
          <div key={i} className="border p-2 mb-2">
            <input value={q.questionText} onChange={e => {
              const updated = [...questions];
              updated[i].questionText = e.target.value;
              setQuestions(updated);
            }} className="w-full p-1 mb-2 border" placeholder="Question text" />
            <select value={q.questionType} onChange={e => {
              const updated = [...questions];
              updated[i].questionType = e.target.value;
              if (e.target.value !== 'text') {
                updated[i].options = ['Option 1', 'Option 2'];
              } else {
                updated[i].options = [];
              }
              setQuestions(updated);
            }} className="w-full p-1 border">
              <option value="text">Text</option>
              <option value="radio">Radio</option>
              <option value="checkbox">Checkbox</option>
            </select>
            {(q.questionType === 'radio' || q.questionType === 'checkbox') &&
              q.options.map((opt, idx) => (
                <input key={idx} value={opt} onChange={e => {
                  const updated = [...questions];
                  updated[i].options[idx] = e.target.value;
                  setQuestions(updated);
                }} className="w-full p-1 border mt-1" placeholder={`Option ${idx + 1}`} />
              ))}
          </div>
        ))}
        <button type="button" onClick={addQuestion} className="bg-blue-600 text-white px-4 py-2 rounded">Add Survey Question</button>

        <button type="submit" className="bg-purple-700 text-white px-6 py-2 rounded">Submit Survey</button>
      </form>
    </div>
  );
};

export default SurveyForm;
