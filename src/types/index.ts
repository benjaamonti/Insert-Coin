export interface Player {
  id: string;
  name: string;
  isHost: boolean;
}

export interface Room {
  id: string;
  code: string;
  gameType: GameType;
  players: Player[];
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
  gameData?: ShutTheBoxData | GuessNumberData;
}

export type GameType = 'shut-the-box' | 'guess-number';

export interface ShutTheBoxData {
  currentTurn: string;
  players: {
    [playerId: string]: {
      numbers: number[];
      name: string;
      score: number;
    };
  };
  lastRoll?: number;
  diceAnimating?: boolean;
  winner?: string;
}

export interface GuessNumberData {
  currentTurn: string;
  players: {
    [playerId: string]: {
      secretNumber: number | null;
      guesses: Guess[];
      name: string;
      hasSetNumber: boolean;
    };
  };
  winner?: string;
  phase: 'setup' | 'playing';
}

export interface Guess {
  number: number;
  hint: 'higher' | 'lower' | 'correct';
}

export interface GameConfig {
  id: GameType;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  icon: string;
  color: string;
}
