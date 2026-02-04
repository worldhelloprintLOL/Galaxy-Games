
import React, { useState, useEffect } from 'react';

const SYMBOLS = ['🎮', '🕹️', '👾', '🚀', '⭐', '🔥', '⚡', '💎'];

const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const shuffled = [...SYMBOLS, ...SYMBOLS]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({ id: index, symbol }));
    setCards(shuffled);
  }, []);

  const handleFlip = (id: number) => {
    if (flipped.length === 2 || matched.includes(id) || flipped.includes(id)) return;
    
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].symbol === cards[second].symbol) {
        setMatched([...matched, first, second]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className="mb-4 text-emerald-400 font-orbitron text-xl">Moves: {moves}</div>
      <div className="grid grid-cols-4 gap-3">
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
          return (
            <button
              key={card.id}
              onClick={() => handleFlip(card.id)}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl text-3xl flex items-center justify-center transition-all duration-300 transform ${
                isFlipped ? 'bg-slate-700 rotate-0' : 'bg-slate-800 rotate-180 hover:bg-slate-700'
              } border-2 border-slate-600 shadow-lg`}
            >
              {isFlipped ? card.symbol : '❓'}
            </button>
          );
        })}
      </div>
      {matched.length === cards.length && matched.length > 0 && (
        <div className="mt-6 text-2xl font-bold text-emerald-400 animate-bounce">Victory!</div>
      )}
    </div>
  );
};

export default MemoryGame;
