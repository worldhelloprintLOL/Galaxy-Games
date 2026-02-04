
import React, { useState, useEffect, useRef, useCallback } from 'react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    const newSnake = [...snake];
    const head = { x: newSnake[0].x + direction.x, y: newSnake[0].y + direction.y };

    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      setGameOver(true);
      return;
    }

    // Self collision
    if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
      setGameOver(true);
      return;
    }

    newSnake.unshift(head);

    // Food collision
    if (head.x === food.x && head.y === food.y) {
      setScore(s => s + 10);
      setFood({
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      });
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [snake, direction, food, gameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction.y === 0) setDirection({ x: 0, y: -1 }); break;
        case 'ArrowDown': if (direction.y === 0) setDirection({ x: 0, y: 1 }); break;
        case 'ArrowLeft': if (direction.x === 0) setDirection({ x: -1, y: 0 }); break;
        case 'ArrowRight': if (direction.x === 0) setDirection({ x: 1, y: 0 }); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    const interval = setInterval(moveSnake, 150);
    return () => clearInterval(interval);
  }, [moveSnake]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 400, 400);

    // Draw Grid (Subtle)
    ctx.strokeStyle = '#1e293b';
    for (let i = 0; i <= 400; i += 20) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 400); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(400, i); ctx.stroke();
    }

    // Draw Snake
    snake.forEach((segment, i) => {
      ctx.fillStyle = i === 0 ? '#10b981' : '#34d399';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#10b981';
      ctx.fillRect(segment.x * 20, segment.y * 20, 18, 18);
    });

    // Draw Food
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.beginPath();
    ctx.arc(food.x * 20 + 10, food.y * 20 + 10, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [snake, food]);

  const reset = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex justify-between w-full max-w-[400px]">
        <span className="text-xl font-bold font-orbitron text-emerald-400">Score: {score}</span>
        {gameOver && <button onClick={reset} className="bg-emerald-600 px-4 py-1 rounded hover:bg-emerald-500 font-bold">Restart</button>}
      </div>
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={400} 
        className="border-4 border-slate-700 rounded-lg shadow-2xl"
      />
      {gameOver && <div className="mt-4 text-red-500 font-bold text-2xl animate-pulse">GAME OVER</div>}
    </div>
  );
};

export default SnakeGame;
