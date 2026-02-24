import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Plus, LogIn, LogOut } from 'lucide-react';
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
  const [roomAction, setRoomAction] = useState<'create' | 'join'>('create');
  const [roomCode, setRoomCode] = useState<string | null>(localStorage.getItem('currentRoomCode'));
  
  const { 
    room, 
    loading: roomLoading,
    error, 
    createRoom, 
    joinRoom, 
    leaveRoom,
    abandonGame,
    startGame, 
    updateGameData, 
    endGame,
    resetRoom 
  } = useRoom(
    roomCode,
    playerId && playerName ? { id: playerId, name: playerName, isHost: false } : null
  );

  // Expulsar si hay error
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

  // Recuperar sesión guardada
  useEffect(() => {
    const storedRoomCode = localStorage.getItem('currentRoomCode');
    const storedGame = localStorage.getItem('currentGame') as GameType | null;
    
    if (storedRoomCode && storedGame && playerName) {
      setCurrentGame(storedGame);
      setRoomCode(storedRoomCode);
      setView('game');
    }
  }, [playerName]);

  // Sincronizar el juego automáticamente con el de la sala si me uno a una
  useEffect(() => {
    if (room?.gameType && currentGame !== room.gameType) {
      setCurrentGame(room.gameType);
      localStorage.setItem('currentGame', room.gameType);
    }
  }, [room?.gameType, currentGame]);

  // Ir al juego cuando la sala empiece
  useEffect(() => {
    if (room?.status === 'playing' && view !== 'game') {
      setView('game');
    }
  }, [room?.status, view]);

  const handleNameSubmit = (name: string) => {
    savePlayerName(name);
    toast.success(`¡Bienvenido, ${name}!`);
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
    setCurrentGame(gameType);
    const player: Player = { id: playerId, name: playerName, isHost: true };
    const code = await createRoom(gameType, player);
    localStorage.setItem('currentRoomCode', code);
    localStorage.setItem('currentGame', gameType);
    setRoomCode(code);
    toast.success('¡Sala creada! Comparte el código con tu amigo.');
  };

  const handleJoinRoom = async (code: string) => {
    const player: Player = { id: playerId, name: playerName, isHost: false };
    const success = await joinRoom(code, player);
    if (success) {
      localStorage.setItem('currentRoomCode', code);
      setRoomCode(code);
      setView('game');
      toast.success('¡Te uniste a la sala!');
    }
  };

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
          score: 78,
          isFinished: false
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
    } else if (winnerId === 'tie') {
      toast.info('¡El juego terminó en empate!');
    } else if (winnerId) {
      toast.info('¡Juego terminado!');
    }
  };

  const handleResetGame = () => {
    resetRoom(); 
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
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
      <Sidebar currentGame={currentGame} onSelectGame={() => {}} onGoHome={handleGoHome} />

      <main className="pt-20 px-4 pb-8">
        <AnimatePresence mode="wait">
          
          {/* VISTA HOME ACTUALIZADA */}
          {view === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }} className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-3xl mb-6 shadow-2xl shadow-amber-500/30">
                  <Coins size={48} className="text-white" />
                </motion.div>
                <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
                  Insert <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Coin</span>
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                  Salas privadas, juegos rápidos. Sin registros, solo diversión.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <motion.button 
                  whileHover={{ scale: 1.02, y: -5 }} 
                  whileTap={{ scale: 0.98 }} 
                  onClick={() => { setRoomAction('create'); setView('room'); }} 
                  className="group relative overflow-hidden bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-2 border-indigo-700/50 rounded-3xl p-8 text-center transition-all hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                      <Plus size={32} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Crear Sala</h3>
                    <p className="text-slate-400">Elige un juego, crea una sala e invita a tu amigo con un código.</p>
                  </div>
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.02, y: -5 }} 
                  whileTap={{ scale: 0.98 }} 
                  onClick={() => { setRoomAction('join'); setView('room'); }} 
                  className="group relative overflow-hidden bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border-2 border-emerald-700/50 rounded-3xl p-8 text-center transition-all hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                      <LogIn size={32} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Unirse a Sala</h3>
                    <p className="text-slate-400">Ingresa el código de 6 letras que te compartieron para empezar a jugar.</p>
                  </div>
                </motion.button>
              </div>

              <div className="mt-16 text-center">
                <p className="text-slate-500">Jugando como <span className="text-amber-400 font-semibold">{playerName}</span></p>
              </div>
            </motion.div>
          )}

          {/* VISTA ROOM MANAGER ACTUALIZADA */}
          {view === 'room' && (
            <motion.div key="room" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <RoomManager 
                initialAction={roomAction}
                onCreateRoom={handleCreateRoom} 
                onJoinRoom={handleJoinRoom} 
                roomCode={roomCode || room?.code || null} 
                onBack={() => setView('home')} 
              />
            </motion.div>
          )}

          {/* VISTA JUEGO */}
          {view === 'game' && (!room || !room.gameData || roomLoading) && (
            <motion.div key="loading" className="flex justify-center items-center py-20">
               <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}

          {view === 'game' && !roomLoading && room && room.gameData && currentGame && (
            <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              
              {room.status === 'playing' && (
                <div className="max-w-6xl mx-auto flex justify-end mb-4">
                  <button 
                    onClick={() => {
                      if (window.confirm('¿Estás seguro que deseas abandonar la partida? Tu oponente ganará automáticamente.')) {
                        abandonGame();
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20"
                  >
                    <LogOut size={16} />
                    Abandonar Partida
                  </button>
                </div>
              )}

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
