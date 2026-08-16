import { useState, useEffect } from 'react';
import ScamResults from './ScamResults';

const MainScreen = () => {
  const [activeTab, setActiveTab] = useState('check');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Fetch scam history when tab changes to history
  useEffect(() => {
    if (activeTab === 'history' && user) {
      fetchHistory();
    }
  }, [activeTab, user]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/scam/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setHistory(data.data.history);
      } else {
        console.error('Failed to fetch history:', data.message);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleHistoryItemClick = (historyItem) => {
    setMessage(historyItem.message);
    setResult({
      label: historyItem.label,
      reasoning: historyItem.reasoning,
      intent: historyItem.intent,
      risk_factors: historyItem.risk_factors,
      confidence_score: historyItem.confidence_score
    });
    setActiveTab('check');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleSubmit = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/scam/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: message.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.message || 'Failed to analyze message');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Merriweather, serif' }}>
              Scam Detection System
            </h1>
            <p className="text-gray-400" style={{ fontFamily: 'Roboto, sans-serif' }}>
              AI-powered protection against fraudulent messages
            </p>
          </div>
          <div className="flex flex-col items-end">
            {user && (
              <span className="text-gray-300 mb-2 font-roboto">Welcome, {user.name}</span>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all font-roboto"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-8 bg-white/5 rounded-lg p-1 border border-white/10">
          <button
            onClick={() => setActiveTab('check')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
              activeTab === 'check'
                ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Check Scams
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            View History
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'check' ? (
          <div className="space-y-6">
            {/* Input Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
              <label className="block text-sm font-medium text-gray-300 mb-3 font-roboto">
                Enter the message to analyze:
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Paste or type the suspicious message here..."
                className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-white placeholder-gray-400 transition-all resize-none font-roboto"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              />
              
              {error && (
                <div className="mt-3 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}
              
              <button
                onClick={handleSubmit}
                disabled={loading || !message.trim()}
                className="mt-4 w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 rounded-lg font-semibold hover:from-gray-700 hover:to-gray-800 focus:ring-4 focus:ring-gray-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-roboto"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : 'Analyze Message'}
              </button>
            </div>

            {/* Results Section */}
            {result && <ScamResults result={result} />}
          </div>
        ) : (
          <div className="space-y-4">
            {historyLoading ? (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 text-center">
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-white font-roboto">Loading history...</span>
                </div>
              </div>
            ) : history.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-semibold text-white mb-2 font-roboto">No History Yet</h3>
                <p className="text-gray-400 font-roboto">Start analyzing messages to build your detection history.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div 
                    key={item._id} 
                    onClick={() => handleHistoryItemClick(item)}
                    className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-white/20 hover:border-white/30 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.label === 'Scam' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                            item.label === 'Not Scam' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                            'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                          } font-roboto`}>
                            {item.label}
                          </span>
                          <span className="text-gray-400 text-sm font-roboto">
                            {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-white font-medium mb-2 font-roboto line-clamp-2">
                          {item.message}
                        </p>
                        <p className="text-gray-400 text-sm font-roboto line-clamp-2">
                          {item.reasoning}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-2xl font-bold text-gray-300 font-roboto">{item.confidence_score}%</div>
                        <div className="text-xs text-gray-500 font-roboto">Confidence</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.risk_factors && item.risk_factors.map((factor, index) => (
                        <span key={index} className="px-2 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400 font-roboto">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainScreen;