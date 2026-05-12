import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';

const DraggableTimer = () => {
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      alert('Timer completed!');
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(1200);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDrag = (e, data) => {
    setPosition({ x: data.x, y: data.y });
  };

  return (
    <Draggable position={position} onDrag={handleDrag}>
      <div
        className="absolute p-4 bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-[#028fa3] rounded-xl shadow-lg z-50 cursor-move transition-all duration-300 hover:shadow-xl"
        // style={{ transform: 'translate(-50%, -50%)', top: '50%', left: '50%' }}
      >
        <h2 className="text-2xl font-bold text-[#028fa3] text-center mb-3 tracking-wide">Timer</h2>
        <div className="text-5xl font-extrabold text-[#028fa3] text-center mb-5 bg-white/80 rounded-lg py-3 px-6 shadow-inner">
          {formatTime(timeLeft)}
        </div>
        <div className="flex justify-center gap-3">
          <button
            onClick={startTimer}
            className="px-4 py-2 bg-[#028fa3] text-white rounded-lg hover:bg-[#026e7f] transition-colors disabled:bg-[#028fa3]/50 disabled:cursor-not-allowed"
            disabled={isRunning}
          >
            Start
          </button>
          <button
            onClick={pauseTimer}
            className="px-4 py-2 bg-[#028fa3] text-white rounded-lg hover:bg-[#026e7f] transition-colors disabled:bg-[#028fa3]/50 disabled:cursor-not-allowed"
            disabled={!isRunning}
          >
            Pause
          </button>
          <button
            onClick={resetTimer}
            className="px-4 py-2 bg-[#028fa3] text-white rounded-lg hover:bg-[#026e7f] transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </Draggable>
  );
};

export default DraggableTimer;