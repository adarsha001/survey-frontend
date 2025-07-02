import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/Auth'; // ✅ import useAuth

const SurveyStatsWithNames = () => {
  const [stats, setStats] = useState({});
  const { token } = useAuth(); // ✅ get token from auth context

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          'https://survey-backend-vugm.onrender.com/surveys/response-stats',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to load response stats:', err);
      }
    };

    if (token) {
      fetchStats();
    }
  }, [token]); // ✅ include token in deps

  return (
<div className="h-screen w-full animate-gradient flex  justify-center text-white  ">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">
        📊 Survey Stats (with User Names)
      </h2>

      {Object.entries(stats).map(([qId, data]) => (
        <div
          key={qId}
          className="mb-6 p-5 bg-gray-700 border border-gray-600 rounded-xl shadow-md"
        >
          <h3 className="text-xl font-semibold mb-4 text-white">{data.questionText}</h3>
          <ul className="space-y-3">
            {Object.entries(data.answers).map(([option, users], idx) => (
              <li
                key={idx}
                className="p-3 bg-gray-600 rounded-lg border border-gray-500"
              >
                <div className="font-medium">
                  ✅ <span className="text-blue-300">{option}</span> — {users.length} user(s)
                </div>
                <div className="text-sm text-gray-200 mt-1 ml-4">
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
