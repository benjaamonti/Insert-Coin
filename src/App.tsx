import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Sparkles } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { PlayerSetup } from '@/components/PlayerSetup';
import { RoomManager } from '@/components/RoomManager';
import { ShutTheBoxGame } from '@/games/shut-the-box/ShutTheBoxGame';
import { GuessNumberGame } from '@/games/guess-number/GuessNumberGame';
import { usePlayerName } from '@/hooks/usePlayerName';
import { useRoom } from '@/hooks/useRoom';
import { GameProvider } from '@/context/GameContext';
import type { Player, GameType, ShutTheBoxData, GuessNumberData } from '@/types';
import { Toaster, toast } from 'sonner';

function GameApp() {
  const { playerName, playerId, isLoaded, savePlayerName } = usePlayerName();
  const [currentGame, setCurrentGame] = useState<GameType | null>(null);
  const [view, setView] = useState<'home' | 'room' | 'game'>('home');
  const [roomCode, setRoomCode] = useState<string | null>(localStorage.getItem('currentRoomCode'));
  
  const { 
    room, 
    loading: roomLoading,
    error, 
    createRoom, 
    joinRoom, 
    leaveRoom, 
    startGame, 
    updateGameData, 
    endGame,
    resetRoom 
  } = useRoom(
    roomCode,
    playerId && playerName ? { id: playerId, name: playerName, isHost: false } : null
  );

  useEffect(() => {
    if (error) {
      toast.error(error);
      if (error === 'Sala no encontrada') {
        localStorage.removeItem('currentRoomCode');
        localStorage.removeItem('currentGame');
        setRoomCode(null);
        setCurrentGame(null);
        setView('home');
      }
    }
  }, [error]);

  useEffect(() => {
    const storedRoomCode = localStorage.getItem('currentRoomCode');
    const storedGame = localStorage.getItem('currentGame') as GameType | null;
    
    if (storedRoomCode && storedGame && playerName) {
      setCurrentGame(storedGame);
      setRoomCode(storedRoomCode);
      setView('game');
    }
  }, [playerName]);

  const handleNameSubmit = (name: string) => {
    savePlayerName(name);
    toast.success(`¡Bienvenido, ${name}!`);
  };

  const handleSelectGame = (game: GameType) => {
    setCurrentGame(game);
    setView('room');
  };

  const handleGoHome = () => {
    if (view === 'game' || roomCode) {
      leaveRoom();
      localStorage.removeItem('currentRoomCode');
      localStorage.removeItem('currentGame');
      setRoomCode(null);
    }
    setCurrentGame(null);
    setView('home');
  };

  const handleCreateRoom = async (gameType: GameType) => {
    const player: Player = {
      id: playerId,
      name: playerName,
      isHost: true
    };
    
    const code = await createRoom(gameType, player);
    localStorage.setItem('currentRoomCode', code);
    localStorage.setItem('currentGame', gameType);
    setRoomCode(code);
    toast.success('¡Sala creada! Comparte el código con tu amigo.');
  };

  const handleJoinRoom = async (code: string) => {
    const player: Player = {
      id: playerId,
      name: playerName,
      isHost: false
    };
    
    const success = await joinRoom(code, player);
    if (success) {
      localStorage.setItem('currentRoomCode', code);
      localStorage.setItem('currentGame', room?.gameType || 'shut-the-box');
      setRoomCode(code);
      setView('game');
      toast.success('¡Te uniste a la sala!');
    }
  };

  // Iniciar el juego cuando hay 2 jugadores
  useEffect(() => {
    if (room && room.players.length === 2 && room.status === 'waiting' && room.players[0].id === playerId) {
      const initialData = createInitialGameData(room.gameType, room.players);
      startGame(initialData);
    }
  }, [room, playerId, startGame]);

  const createInitialGameData = (gameType: GameType, players: Player[]): ShutTheBoxData | GuessNumberData => {
    if (gameType === 'shut-the-box') {
      const data: ShutTheBoxData = {
        currentTurn: players[0].id,
        players: {}
      };
      players.forEach(p => {
        data.players[p.id] = {
          numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          name: p.name,
          score: 78
        };
      });
      return data;
    } else {
      const data: GuessNumberData = {
        currentTurn: players[0].id,
        phase: 'setup',
        players: {}
      };
      players.forEach(p => {
        data.players[p.id] = {
          secretNumber: null,
          guesses: [],
          name: p.name,
          hasSetNumber: false
        };
      });
      return data;
    }
  };

  const handleUpdateGame = (data: ShutTheBoxData | GuessNumberData) => {
    updateGameData(data);
  };

  const handleEndGame = (winnerId?: string) => {
    endGame(winnerId);
    if (winnerId === playerId) {
      toast.success('¡Ganaste la partida! 🎉');
    } else if (winnerId) {
      toast.info('¡Juego terminado!');
    }
  };

  const handleResetGame = () => {
    resetRoom();
    setView('room');
    localStorage.removeItem('currentRoomCode');
    localStorage.removeItem('currentGame');
    setRoomCode(null);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!playerName) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <Toaster position="top-center" theme="dark" />
        <PlayerSetup onSubmit={handleNameSubmit} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <Toaster position="top-center" theme="dark" />
      
      <Sidebar 
        currentGame={currentGame} 
        onSelectGame={handleSelectGame}
        onGoHome={handleGoHome}
      />

      <main className="pt-20 px-4 pb-8">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mb-6 shadow-2xl shadow-indigo-500/30"
                >
                  <Gamepad2 size={48} className="text-white" />
                </motion.div>
                
                <h1 className="text-5xl font-bold text-white mb-4">
                  GameHub{' '}
                  <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    Multijugador
                  </span>
                </h1>
                
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                  Juega con tus amigos en tiempo real. Sin registro, solo diversión.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <motion.button
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectGame('shut-the-box')}
                  className="group relative overflow-hidden bg-gradient-to-br from-amber-900/50 to-orange-900/50 border-2 border-amber-700/50 rounded-3xl p-8 text-left transition-all hover:border-amber-500 hover:shadow-2xl hover:shadow-amber-500/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4">
                      <span className="text-3xl">🎲</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">Shut the Box</h3>
                    <p className="text-slate-400 mb-4">
                      Tira los dados y elimina números de tu tabla. El primero en limpiarla gana.
                    </p>
                    
                    <div className="flex items-center gap-2 text-amber-400">
                      <Sparkles size={16} />
                      <span className="text-sm">2 jugadores</span>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectGame('guess-number')}
                  className="group relative overflow-hidden bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border-2 border-emerald-700/50 rounded-3xl p-8 text-left transition-all hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4">
                      <span className="text-3xl">🎯</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">Adivina el Número</h3>
                    <p className="text-slate-400 mb-4">
                      Elige un número secreto y adivina el de tu oponente. ¿Podrás descifrarlo?
                    </p>
                    
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Sparkles size={16} />
                      <span className="text-sm">2 jugadores</span>
                    </div>
                  </div>
                </motion.button>
              </div>

              <div className="mt-12 text-center">
                <p className="text-slate-500">
                  Jugando como{' '}
                  <span className="text-indigo-400 font-semibold">{playerName}</span>
                </p>
              </div>
            </motion.div>
          )}

          {view === 'room' && currentGame && (
            <motion.div
              key="room"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <RoomManager
                onCreateRoom={handleCreateRoom}
                onJoinRoom={handleJoinRoom}
                roomCode={roomCode || room?.code || null}
                onBack={() => setView('home')}
              />
            </motion.div>
          )}

          {view === 'game' && roomLoading && (
            <motion.div key="loading" className="flex justify-center items-center py-20">
               <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}

          {view === 'game' && !roomLoading && room && currentGame && (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {currentGame === 'shut-the-box' && (
                <ShutTheBoxGame
                  room={room}
                  currentPlayer={{ id: playerId, name: playerName, isHost: room.players[0]?.id === playerId }}
                  onUpdateGame={handleUpdateGame}
                  onEndGame={handleEndGame}
                  onReset={handleResetGame}
                />
              )}
              {currentGame === 'guess-number' && (
                <GuessNumberGame
                  room={room}
                  currentPlayer={{ id: playerId, name: playerName, isHost: room.players[0]?.id === playerId }}
                  onUpdateGame={handleUpdateGame}
                  onEndGame={handleEndGame}
                  onReset={handleResetGame}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <GameApp />
    </GameProvider>
  );
}

export default App;
