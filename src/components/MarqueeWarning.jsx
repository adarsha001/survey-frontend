import React from 'react';

const MarqueeWarning = () => {
  const message = "⚠️ This website may not work properly on macOS or iOS devices. For the best experience, use a Windows or Android device. | 🛑 Please make sure only one tab of this website is open at a time to avoid voice recognition issues (Web Speech API error).";
  
  // Duplicate the message to create seamless looping
  const duplicatedMessage = `${message} • ${message} • ${message}`;

  return (
    <div className="w-full bg-green-600 text-white py-2 overflow-hidden border-b border-green-700">
      <div className="whitespace-nowrap">
        <div className="inline-block animate-slow-marquee whitespace-nowrap pl-[100%]">
          {duplicatedMessage}
        </div>
      </div>
    </div>
  );
};

export default MarqueeWarning;