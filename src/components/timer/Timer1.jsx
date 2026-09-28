import React, { useState, useEffect } from 'react';

const HeaderTimer = () => {
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes in seconds

  useEffect(() => {
    let timer;
    timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    if (timeLeft === 0) {
      alert('Timer completed!');
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center p-1 bg-gradient-to-r from-gray-100 to-gray-200 border border-[#155EEF] rounded-md shadow-sm">
      <span className="text-xs font-medium text-[#155EEF] mr-1">Timer:</span>
      <span className="text-sm font-semibold text-[#155EEF]">{formatTime(timeLeft)}</span>
    </div>
  );
};

export default HeaderTimer;