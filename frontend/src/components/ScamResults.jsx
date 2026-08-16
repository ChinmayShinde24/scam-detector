const ScamResults = ({ result }) => {
  const getResultColor = (label) => {
    switch (label.toLowerCase()) {
      case 'scam':
        return {
          bg: 'from-red-500/20 to-red-600/20',
          border: 'border-red-500/50',
          text: 'text-red-400',
          icon: 'text-red-500',
          badge: 'bg-red-500'
        };
      case 'not scam':
        return {
          bg: 'from-green-500/20 to-green-600/20',
          border: 'border-green-500/50',
          text: 'text-green-400',
          icon: 'text-green-500',
          badge: 'bg-green-500'
        };
      case 'uncertain':
        return {
          bg: 'from-yellow-500/20 to-yellow-600/20',
          border: 'border-yellow-500/50',
          text: 'text-yellow-400',
          icon: 'text-yellow-500',
          badge: 'bg-yellow-500'
        };
      default:
        return {
          bg: 'from-gray-500/20 to-gray-600/20',
          border: 'border-gray-500/50',
          text: 'text-gray-400',
          icon: 'text-gray-500',
          badge: 'bg-gray-500'
        };
    }
  };

  const colors = getResultColor(result.label);

  const getIcon = (label) => {
    switch (label.toLowerCase()) {
      case 'scam':
        return (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'not scam':
        return (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'uncertain':
        return (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className={`bg-gradient-to-r ${colors.bg} backdrop-blur-lg rounded-2xl shadow-2xl p-6 border ${colors.border}`}>
      {/* Classification Result */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-full ${colors.icon} bg-white/10`}>
            {getIcon(result.label)}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400 font-roboto">Classification Result</h3>
            <p className={`text-2xl font-bold ${colors.text} font-roboto`}>{result.label}</p>
          </div>
        </div>
        <span className={`px-4 py-2 rounded-full ${colors.badge} text-white text-sm font-semibold font-roboto`}>
          {result.label === 'Scam' ? 'High Risk' : result.label === 'Not Scam' ? 'Safe' : 'Review Needed'}
        </span>
      </div>

      {/* Intent */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-400 mb-2 font-roboto">Intent</h4>
        <p className="text-white font-roboto">{result.intent}</p>
      </div>

      {/* Reasoning */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-400 mb-2 font-roboto">Reasoning</h4>
        <p className="text-gray-300 font-roboto leading-relaxed">{result.reasoning}</p>
      </div>

      {/* Risk Factors */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-3 font-roboto">Risk Factors</h4>
        <div className="flex flex-wrap gap-2">
          {result.risk_factors && result.risk_factors.length > 0 ? (
            result.risk_factors.map((factor, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-sm text-gray-300 font-roboto"
              >
                {factor}
              </span>
            ))
          ) : (
            <span className="text-gray-500 font-roboto">No specific risk factors identified</span>
          )}
        </div>
      </div>

      {/* Confidence Indicator */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400 font-roboto">AI Confidence</span>
          <div className="flex items-center space-x-2">
            <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full ${colors.badge} rounded-full`}
                style={{ width: `${result.confidence_score || 0}%` }}
              ></div>
            </div>
            <span className={`text-sm font-semibold ${colors.text} font-roboto`}>
              {result.confidence_score || 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScamResults;