
import React from 'react';
import { Game } from './types';
import SnakeGame from './games/SnakeGame';
import MemoryGame from './games/MemoryGame';
import ClickerGame from './games/ClickerGame';
import ReactionGame from './games/ReactionGame';

export const GAMES: Game[] = [
  {
    id: 'snake',
    title: 'Neon Snake',
    description: 'Classic snake game with a futuristic neon aesthetic. Eat the glowing orbs to grow.',
    category: 'Arcade',
    thumbnail: 'https://picsum.photos/seed/snake/400/250',
    component: SnakeGame
  },
  {
    id: 'memory',
    title: 'Mind Match',
    description: 'Test your brain with this classic tile-matching memory puzzle.',
    category: 'Puzzle',
    thumbnail: 'https://picsum.photos/seed/memory/400/250',
    component: MemoryGame
  },
  {
    id: 'clicker',
    title: 'Crystal Clicker',
    description: 'Mine precious crystals and purchase upgrades to automate your empire.',
    category: 'Strategy',
    thumbnail: 'https://picsum.photos/seed/clicker/400/250',
    component: ClickerGame
  },
  {
    id: 'reaction',
    title: 'Speed Blitz',
    description: 'How fast are your reflexes? Click the targets before they disappear.',
    category: 'Skill',
    thumbnail: 'https://picsum.photos/seed/speed/400/250',
    component: ReactionGame
  }
];
