import React, { createContext, useContext, useState } from 'react';
import type { Player, GameType } from '@/types';

interface GameContextType {
  currentPlayer: Player | null;
  setCurrentPlayer: (player: Player | null) => void;
  currentRoomCode: string | null;
  setCurrentRoomCode: (code: string | null) => void;
  selectedGame: GameType | null;
  setSelectedGame: (game: GameType | null) => void;
  isInRoom: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [currentRoomCode, setCurrentRoomCode] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);

  const isInRoom = !!currentRoomCode;

  return (
    <GameContext.Provider value={{
      currentPlayer,
      setCurrentPlayer,
      currentRoomCode,
      setCurrentRoomCode,
      selectedGame,
      setSelectedGame,
      isInRoom
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}
