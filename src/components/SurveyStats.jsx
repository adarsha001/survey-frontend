import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/Auth';

const SurveyStatsWithNames = () => {
  const [stats, setStats] = useState({});
  const [raw, setRaw] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(
          'https://survey-backend-vugm.onrender.com/surveys/response-stats',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Stats API response:', res.data);
        setRaw(res.data.data);

        if (res.data.success && res.data.data && typeof res.data.data === 'object') {
          setStats(res.data.data);
        } else {
          setStats({});
        }
      } catch (err) {
        console.error('Stats fetch error:', err);
        setStats({});
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mb-4"></div>
          <p className="text-white text-lg font-medium">Fetching survey statistics...</p>
        </div>
      </div>
    );
  }

  if (Object.keys(stats).length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center px-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 max-w-2xl w-full shadow-2xl border border-gray-700">
          <h2 className="text-2xl font-bold text-blue-400 mb-4">No stats available yet</h2>
          <p className="text-gray-300 mb-6">There are no survey responses to display at this time.</p>
          <div className="bg-gray-900/80 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm text-green-400 font-mono">
              {JSON.stringify(raw, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl mb-3">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
              Survey Statistics
            </span>
          </h1>
          <p className="mt-3 text-xl text-gray-300">
            Detailed response breakdown with respondent names
          </p>
        </div>

        <div className="space-y-8">
          {Object.entries(stats).map(([qId, data]) => (
            <div
              key={qId}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-700 transition-all hover:border-blue-400/30 hover:shadow-blue-400/10"
            >
              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-bold text-white mb-6 pb-2 border-b border-gray-700">
                  {data.questionText}
                </h3>
                
                <div className="space-y-4">
                  {Object.entries(data.answers).map(([opt, users]) => (
                    <div 
                      key={opt} 
                      className="bg-gray-700/50 rounded-lg overflow-hidden transition-all hover:bg-gray-700/70"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white flex items-center">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 mr-3">
                              {users.length}
                            </span>
                            <span className="text-blue-200">{opt}</span>
                          </span>
                          <span className="text-sm text-gray-400">
                            {users.length} {users.length === 1 ? 'response' : 'responses'}
                          </span>
                        </div>
                        
                        {users.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-600">
                            <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Respondents:</p>
                            <div className="flex flex-wrap gap-2">
                              {users.map((user, index) => (
                                <span 
                                  key={index}
                                  className="text-sm px-3 py-1 bg-gray-600/50 rounded-full text-gray-200"
                                >
                                  {user}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SurveyStatsWithNames;