import { useEffect, useState } from 'react';
import axios from 'axios';
import SurveyStats from './SurveyStats';

const MySurveyResponses = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const res = await axios.get('https://survey-backend-vugm.onrender.com/surveys/all-responses');
        setResponses(res.data.data);
      } catch (err) {
        setError('Failed to fetch responses.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, []);

  if (loading) return <div className="p-4 text-gray-600">Loading responses...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">All Survey Responses</h1>

      {responses.length === 0 ? (
        <p className="text-gray-600">No responses found.</p>
      ) : (
        responses.map((resp, idx) => (
          <div key={idx} className="mb-6 p-4 rounded shadow border bg-white">
            <div className="mb-3 text-sm text-gray-500">
              Submitted by <span className="font-semibold">{resp.user?.username}</span> ({resp.user?.email}) <br />
              <span className="text-xs">Submitted at: {new Date(resp.submittedAt).toLocaleString()}</span>
            </div>

            {resp.responses.map((r, i) => (
              <div key={i} className="mb-4 pl-4 border-l-4 border-blue-400">
                <div className="text-sm font-semibold text-blue-700">
                  Survey: {r.surveyTitle}
                </div>
                <div className="text-gray-800 mb-1">Q: {r.questionText}</div>
                <div className="text-green-700 font-medium">Ans: {r.userAnswer}</div>
              </div>
            ))}
          </div>
        ))
      )}
      <div>
        <SurveyStats/>
      </div>
    </div>
  );
};

export default MySurveyResponses;
