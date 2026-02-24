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
  lastActivity?: number;
  pings?: Record<string, number>;
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
      isFinished?: boolean;
    };
  };
  lastRoll?: number | null;
  diceValues?: [number, number] | null; // NUEVO: Dados exactos
  isRolling?: boolean; // NUEVO: Animación de dados global
  selectedNumbers?: number[]; // NUEVO: Números elegidos en tiempo real
  winner?: string | 'tie';
  playAgainVotes?: string[];
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
  playAgainVotes?: string[];
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
