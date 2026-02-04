
import React, { useState, useEffect } from 'react';

const ClickerGame: React.FC = () => {
  const [crystals, setCrystals] = useState(0);
  const [clickPower, setClickPower] = useState(1);
  const [autoPower, setAutoPower] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCrystals(c => c + autoPower);
    }, 1000);
    return () => clearInterval(timer);
  }, [autoPower]);

  const upgrades = [
    { name: 'Sledgehammer', cost: 15, power: 1, type: 'click' },
    { name: 'Auto-Drill', cost: 50, power: 2, type: 'auto' },
    { name: 'Crystal Magnet', cost: 200, power: 5, type: 'click' },
    { name: 'Robot Miner', cost: 500, power: 10, type: 'auto' },
  ];

  const buyUpgrade = (u: any) => {
    if (crystals >= u.cost) {
      setCrystals(crystals - u.cost);
      if (u.type === 'click') setClickPower(p => p + u.power);
      if (u.type === 'auto') setAutoPower(p => p + u.power);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 items-center">
      <div className="flex-1 flex flex-col items-center">
        <h3 className="text-3xl font-orbitron text-cyan-400 mb-2">{Math.floor(crystals)} 💎</h3>
        <p className="text-slate-400 mb-6">+{autoPower}/sec</p>
        <button
          onClick={() => setCrystals(crystals + clickPower)}
          className="w-48 h-48 bg-slate-800 rounded-full border-8 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-95 transition-transform flex items-center justify-center text-6xl"
        >
          💎
        </button>
      </div>
      <div className="flex-1 space-y-4 w-full">
        <h4 className="font-bold text-lg border-b border-slate-700 pb-2">Upgrades</h4>
        {upgrades.map(u => (
          <button
            key={u.name}
            onClick={() => buyUpgrade(u)}
            disabled={crystals < u.cost}
            className="w-full flex justify-between items-center p-3 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors border border-slate-600"
          >
            <div className="text-left">
              <div className="font-bold">{u.name}</div>
              <div className="text-xs text-slate-400">+{u.power} {u.type === 'click' ? 'per click' : 'per sec'}</div>
            </div>
            <div className="text-cyan-400 font-bold">{u.cost} 💎</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ClickerGame;
