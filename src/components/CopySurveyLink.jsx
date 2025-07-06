import React, { useState } from 'react';

const CopySurveyLink = ({ surveyId }) => {
  const [copied, setCopied] = useState(false);

  const surveyUrl = `https://surveyvoice.vercel.app/surveys/${surveyId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(surveyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-2">
      <input
        readOnly
        value={surveyUrl}
        className="flex-1 bg-gray-900 text-white px-3 py-2 rounded border border-gray-600 w-full"
      />
      <button
        onClick={copyToClipboard}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded w-full sm:w-auto"
      >
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
    </div>
  );
};

export default CopySurveyLink;
