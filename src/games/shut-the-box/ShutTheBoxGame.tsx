import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dices, RotateCcw, Trophy, ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Room, Player, ShutTheBoxData } from '@/types';
import { Dice } from './Dice';
import { NumberTile } from './NumberTile';

interface ShutTheBoxGameProps {
  room: Room;
  currentPlayer: Player;
  onUpdateGame: (data: ShutTheBoxData) => void;
  onEndGame: (winnerId?: string) => void;
  onReset: () => void;
}

export function ShutTheBoxGame({ room, currentPlayer, onUpdateGame, onEndGame, onReset }: ShutTheBoxGameProps) {
  const gameData = room.gameData as ShutTheBoxData;
  
  if (!gameData || !gameData.players || !gameData.players[currentPlayer.id]) {
    return null;
  }

  const isMyTurn = gameData.currentTurn === currentPlayer.id;
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [rolling, setRolling] = useState(false);
  const [diceValues, setDiceValues] = useState<[number, number]>([1, 1]);
  const [showCombinationError, setShowCombinationError] = useState(false);

  const players = Object.entries(gameData.players);
  const myData = gameData.players[currentPlayer.id];
  const opponentId = players.find(([id]) => id !== currentPlayer.id)?.[0];
  const opponentData = opponentId ? gameData.players[opponentId] : null;

  const canMakeMove = (target: number, numbers: number[]): boolean => {
    const canForm = (t: number, idx: number): boolean => {
      if (t === 0) return true;
      if (t < 0 || idx >= numbers.length) return false;
      return canForm(t - numbers[idx], idx + 1) || canForm(t, idx + 1);
    };
    return canForm(target, 0);
  };

  const rollDice = () => {
    if (!isMyTurn || rolling || gameData.lastRoll) return;
    
    setRolling(true);
    let rolls = 0;
    const maxRolls = 10;
    
    const rollInterval = setInterval(() => {
      setDiceValues([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]);
      rolls++;
      
      if (rolls >= maxRolls) {
        clearInterval(rollInterval);
        const finalDice1 = Math.floor(Math.random() * 6) + 1;
        const finalDice2 = Math.floor(Math.random() * 6) + 1;
        const sum = finalDice1 + finalDice2;
        
        setDiceValues([finalDice1, finalDice2]);
        setRolling(false);
        
        const myNumbers = gameData.players[currentPlayer.id].numbers;
        const canContinue = canMakeMove(sum, myNumbers);
        
        const newGameData: ShutTheBoxData = {
          ...gameData,
          lastRoll: sum,
          diceAnimating: false
        };
        
        onUpdateGame(newGameData);
        
        if (!canContinue) {
          setTimeout(() => {
            const winner = opponentId;
            onEndGame(winner);
          }, 1500);
        }
      }
    }, 100);
  };

  const toggleNumber = (num: number) => {
    if (!isMyTurn || !gameData.lastRoll || rolling) return;
    
    setSelectedNumbers(prev => {
      if (prev.includes(num)) {
        return prev.filter(n => n !== num);
      }
      return [...prev, num];
    });
    setShowCombinationError(false);
  };

  const submitMove = () => {
    if (!isMyTurn || !gameData.lastRoll || selectedNumbers.length === 0) return;
    
    const sum = selectedNumbers.reduce((a, b) => a + b, 0);
    if (sum !== gameData.lastRoll) {
      setShowCombinationError(true);
      return;
    }

    const myNumbers = gameData.players[currentPlayer.id].numbers;
    const newNumbers = myNumbers.filter(n => !selectedNumbers.includes(n));
    
    const newGameData: ShutTheBoxData = {
      ...gameData,
      players: {
        ...gameData.players,
        [currentPlayer.id]: {
          ...gameData.players[currentPlayer.id],
          numbers: newNumbers,
          score: newNumbers.reduce((a, b) => a + b, 0)
        }
      },
      currentTurn: opponentId || currentPlayer.id,
      lastRoll: null as any 
    };

    onUpdateGame(newGameData);
    setSelectedNumbers([]);

    if (newNumbers.length === 0) {
      onEndGame(currentPlayer.id);
    }
  };

  const selectedSum = selectedNumbers.reduce((a, b) => a + b, 0);
  const targetSum = gameData.lastRoll || 0;

  if (room.status === 'finished') {
    const winner = gameData.winner;
    const isWinner = winner === currentPlayer.id;
    
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 15 }} className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 ${isWinner ? 'bg-gradient-to-br from-yellow-400 to-amber-600' : 'bg-gradient-to-br from-slate-500 to-slate-700'}`}>
          <Trophy size={60} className="text-white" />
        </motion.div>
        <h2 className="text-4xl font-bold text-white mb-2">{isWinner ? '¡Ganaste!' : '¡Juego Terminado!'}</h2>
        <p className="text-slate-400 text-lg mb-8">{isWinner ? '¡Felicitaciones! Limpiaste tu tabla primero.' : `${gameData.players[winner!]?.name} ganó la partida`}</p>

        <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-md">
          {players.map(([id, data]) => (
            <div key={id} className={`p-4 rounded-xl ${id === winner ? 'bg-yellow-500/20 border-2 border-yellow-500' : 'bg-slate-700/50'}`}>
              <p className="text-sm text-slate-400">{data.name}</p>
              <p className="text-2xl font-bold text-white">{data.score} pts</p>
            </div>
          ))}
        </div>

        {currentPlayer.isHost && (
          <Button onClick={onReset} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-6 text-lg">
            <RotateCcw className="mr-2" size={20} />
            Jugar de Nuevo
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto mb-6">
        <div className="grid grid-cols-2 gap-4">
          {players.map(([id, data], index) => (
            <motion.div key={id} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className={`p-4 rounded-2xl ${gameData.currentTurn === id ? 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 border-2 border-amber-500' : 'bg-slate-700/50 border-2 border-transparent'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${id === currentPlayer.id ? 'bg-indigo-500' : 'bg-purple-500'}`}>
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">{data.name}</p>
                  <p className="text-xs text-slate-400">
                    {id === currentPlayer.id ? 'Tú' : 'Oponente'}
                    {gameData.currentTurn === id && ' - Tu turno'}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="bg-gradient-to-br from-amber-900/40 to-amber-800/30 rounded-3xl p-6 border-2 border-amber-700/50">
          <h3 className="text-amber-400 font-semibold mb-4 flex items-center gap-2">
            <Dices size={18} /> Tu Tabla
          </h3>

          <div className="bg-gradient-to-br from-amber-950 to-amber-900 rounded-2xl p-6 mb-6 shadow-inner">
            <div className="grid grid-cols-6 gap-2">
              {myData?.numbers.map((num) => (
                <NumberTile key={num} number={num} selected={selectedNumbers.includes(num)} onClick={() => toggleNumber(num)} disabled={!isMyTurn || !gameData.lastRoll || rolling} />
              ))}
            </div>
            {myData?.numbers.length === 0 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center py-8">
                <Trophy size={48} className="text-yellow-400 mx-auto mb-2" />
                <p className="text-yellow-400 font-semibold">¡Tabla Limpia!</p>
              </motion.div>
            )}
          </div>

          {isMyTurn && (
            <div className="space-y-4">
              {!gameData.lastRoll ? (
                <Button onClick={rollDice} disabled={rolling} className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white py-6 text-lg">
                  <motion.div animate={rolling ? { rotate: 360 } : {}} transition={{ duration: 0.5, repeat: rolling ? Infinity : 0 }}>
                    <Dices className="mr-2" size={24} />
                  </motion.div>
                  {rolling ? 'Tirando...' : 'Tirar Dados'}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center gap-4">
                    <Dice value={diceValues[0]} rolling={rolling} />
                    <Dice value={diceValues[1]} rolling={rolling} />
                  </div>
                  <div className="text-center">
                    <p className="text-amber-400 text-3xl font-bold">= {gameData.lastRoll}</p>
                  </div>
                  
                  {selectedNumbers.length > 0 && (
                    <div className="text-center space-y-2">
                      <p className="text-slate-300">Seleccionados: {selectedNumbers.join(' + ')} = {selectedSum}</p>
                      {selectedSum === targetSum ? (
                        <Button onClick={submitMove} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-8">
                          <ArrowRight className="mr-2" size={18} />
                          Confirmar Jugada
                        </Button>
                      ) : (
                        <p className="text-amber-400 text-sm">Necesitas sumar {targetSum}</p>
                      )}
                    </div>
                  )}

                  {showCombinationError && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-center text-sm">
                      La suma no coincide con el resultado de los dados
                    </motion.p>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="bg-gradient-to-br from-purple-900/40 to-purple-800/30 rounded-3xl p-6 border-2 border-purple-700/50">
          <h3 className="text-purple-400 font-semibold mb-4 flex items-center gap-2">
            <User size={18} /> Tabla de {opponentData?.name}
          </h3>

          <div className="bg-gradient-to-br from-purple-950 to-purple-900 rounded-2xl p-6 shadow-inner">
            <div className="grid grid-cols-6 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                <div key={num} className={`aspect-square rounded-lg flex items-center justify-center text-lg font-bold transition-all ${opponentData?.numbers.includes(num) ? 'bg-purple-700/50 text-purple-300 border-2 border-purple-600/50' : 'bg-purple-900/30 text-purple-900/30 border-2 border-purple-800/20'}`}>
                  {num}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-purple-800/20 rounded-xl">
            <p className="text-purple-300 text-center">
              {gameData.currentTurn !== currentPlayer.id 
                ? `Esperando a que ${opponentData?.name} tire los dados...`
                : 'Es tu turno'
              }
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
