
import React from 'react';

export type GameCategory = string;

export interface Game {
  id: string;
  title: string;
  description: string;
  category: GameCategory;
  thumbnail: string;
  // Standard games use React components
  component?: React.ComponentType;
  // Custom games added via Dev Mode use raw HTML strings
  htmlContent?: string;
  isCustom?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// Added ProxyNode interface to resolve import error in App.tsx
export interface ProxyNode {
  id: string;
  name: string;
  url: string;
  description: string;
}
