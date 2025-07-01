import { useEffect, useState } from 'react';
import axios from 'axios';

const SurveyStatsWithNames = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('https://survey-backend-vugm.onrender.com/surveys/response-stats');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to load response stats:', err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Survey Stats (with User Names)</h2>
      {Object.entries(stats).map(([qId, data]) => (
        <div key={qId} className="mb-6 p-4 bg-white border rounded shadow">
          <h3 className="text-lg font-semibold mb-3">{data.questionText}</h3>
          <ul className="space-y-2">
            {Object.entries(data.answers).map(([option, users], idx) => (
              <li key={idx} className="p-2 border rounded">
                <div className="font-medium">
                  ✅ <span className="text-blue-600">{option}</span> — {users.length} user(s)
                </div>
                <div className="text-sm text-gray-700 ml-4">
                  {users.join(', ')}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default SurveyStatsWithNames;
