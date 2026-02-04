
import React, { useState, useEffect } from 'react';

const ReactionGame: React.FC = () => {
  const [target, setTarget] = useState({ x: 50, y: 50 });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  const moveTarget = () => {
    if (!isActive) return;
    setScore(s => s + 1);
    setTarget({
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10
    });
  };

  const start = () => {
    setScore(0);
    setTimeLeft(30);
    setIsActive(true);
    moveTarget();
  };

  return (
    <div className="relative w-full h-[400px] bg-slate-900 rounded-xl border-2 border-slate-700 overflow-hidden cursor-crosshair">
      {!isActive ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-10">
          {timeLeft === 0 && <p className="text-2xl font-bold text-emerald-400 mb-4">Final Score: {score}</p>}
          <button 
            onClick={start}
            className="bg-emerald-600 px-8 py-3 rounded-full font-bold text-xl hover:bg-emerald-500 transition-colors"
          >
            {timeLeft === 0 ? 'Try Again' : 'Start Challenge'}
          </button>
        </div>
      ) : (
        <div className="absolute top-4 left-4 flex gap-6 z-20">
          <div className="text-emerald-400 font-orbitron">Hits: {score}</div>
          <div className="text-red-400 font-orbitron">Time: {timeLeft}s</div>
        </div>
      )}
      
      {isActive && (
        <button
          onClick={moveTarget}
          style={{ left: `${target.x}%`, top: `${target.y}%` }}
          className="absolute w-12 h-12 bg-emerald-500 rounded-full border-4 border-white shadow-[0_0_20px_#10b981] active:scale-90 transition-transform -translate-x-1/2 -translate-y-1/2"
        />
      )}
    </div>
  );
};

export default ReactionGame;
