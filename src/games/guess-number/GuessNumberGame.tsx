import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Check, RotateCcw, Trophy, Lock, User, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Room, Player, GuessNumberData, Guess } from '@/types';
import { GuessRow } from './GuessRow';
import { NumberSelector } from './NumberSelector';

interface GuessNumberGameProps {
  room: Room;
  currentPlayer: Player;
  onUpdateGame: (data: GuessNumberData) => void;
  onEndGame: (winnerId?: string) => void;
  onReset: () => void;
}

export function GuessNumberGame({ room, currentPlayer, onUpdateGame, onEndGame, onReset }: GuessNumberGameProps) {
  const gameData = room.gameData as GuessNumberData;

  // 1. SOLUCIÓN A LA PANTALLA EN BLANCO: 
  // Validamos que los datos existan antes de ejecutar cualquier lógica
  if (!gameData || !gameData.players || !gameData.players[currentPlayer.id]) {
    return null;
  }

  const isMyTurn = gameData.currentTurn === currentPlayer.id;
  const [secretNumber, setSecretNumber] = useState<number | ''>('');
  const [guessInput, setGuessInput] = useState<number | ''>('');
  const [showSecretInput, setShowSecretInput] = useState(false);

  const players = Object.entries(gameData.players);
  const myData = gameData.players[currentPlayer.id];
  const opponentId = players.find(([id]) => id !== currentPlayer.id)?.[0];
  const opponentData = opponentId ? gameData.players[opponentId] : null;

  const submitSecretNumber = () => {
    if (secretNumber === '' || secretNumber < 1 || secretNumber > 100) return;

    const newGameData: GuessNumberData = {
      ...gameData,
      players: {
        ...gameData.players,
        [currentPlayer.id]: {
          ...myData,
          secretNumber: secretNumber as number,
          hasSetNumber: true
        }
      }
    };

    // Si ambos han elegido, empezar el juego
    const otherPlayerId = players.find(([id]) => id !== currentPlayer.id)?.[0];
    if (otherPlayerId && gameData.players[otherPlayerId].hasSetNumber) {
      newGameData.phase = 'playing';
    }

    onUpdateGame(newGameData);
    setShowSecretInput(false);
  };

  const submitGuess = () => {
    if (guessInput === '' || !opponentId) return;

    const guess = guessInput as number;
    const opponentSecret = gameData.players[opponentId].secretNumber;
    
    if (opponentSecret === null) return;

    let hint: Guess['hint'];
    if (guess === opponentSecret) {
      hint = 'correct';
    } else if (guess < opponentSecret) {
      hint = 'higher';
    } else {
      hint = 'lower';
    }

    const newGuess: Guess = { number: guess, hint };

    const newGameData: GuessNumberData = {
      ...gameData,
      players: {
        ...gameData.players,
        [currentPlayer.id]: {
          ...myData,
          guesses: [...myData.guesses, newGuess]
        }
      },
      currentTurn: opponentId
    };

    onUpdateGame(newGameData);
    setGuessInput('');

    if (hint === 'correct') {
      setTimeout(() => {
        onEndGame(currentPlayer.id);
      }, 1000);
    }
  };

  // Pantalla de configuración inicial
  if (gameData.phase === 'setup' || !myData?.hasSetNumber) {
    
    // 2. SOLUCIÓN A LA CONFIRMACIÓN INIFINITA: 
    // Si el jugador ya confirmó, le mostramos una pantalla de espera en lugar de volver al inicio
    if (myData?.hasSetNumber) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-[60vh] p-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
            className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6"
          >
            <Check size={48} className="text-white" />
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-2">¡Número Confirmado!</h2>
          <p className="text-slate-400 text-center mb-8 max-w-md">
            Tu número secreto es el <span className="text-emerald-400 font-bold text-xl">{myData.secretNumber}</span>.
            <br /><br />
            Esperando a que {opponentData?.name || 'tu oponente'} elija el suyo...
          </p>

          <Button
            variant="outline"
            onClick={() => {
              // Permitimos cambiar el número deshaciendo el paso en la base de datos
              const newGameData: GuessNumberData = {
                ...gameData,
                players: {
                  ...gameData.players,
                  [currentPlayer.id]: {
                    ...myData,
                    hasSetNumber: false,
                    secretNumber: null
                  }
                }
              };
              onUpdateGame(newGameData);
              setShowSecretInput(false);
              setSecretNumber('');
            }}
            className="border-slate-600 text-slate-300"
          >
            Cambiar Número
          </Button>
        </motion.div>
      );
    }

    // Si aún no elige, mostramos el selector normal
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] p-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
          className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6"
        >
          <Lock size={48} className="text-white" />
        </motion.div>

        <h2 className="text-3xl font-bold text-white mb-2">Elige tu Número Secreto</h2>
        <p className="text-slate-400 text-center mb-8 max-w-md">
          Selecciona un número del 1 al 100. Tu oponente intentará adivinarlo.
          ¡No se lo reveles!
        </p>

        <AnimatePresence mode="wait">
          {!showSecretInput ? (
            <motion.div
              key="selector"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <NumberSelector
                value={secretNumber as number}
                onChange={setSecretNumber}
                onConfirm={() => setShowSecretInput(true)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-800 rounded-2xl p-8 text-center"
            >
              <p className="text-slate-400 mb-4">Tu número secreto es:</p>
              <p className="text-6xl font-bold text-emerald-400 mb-6">{secretNumber}</p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowSecretInput(false)}
                  className="border-slate-600 text-slate-300"
                >
                  Cambiar
                </Button>
                <Button
                  onClick={submitSecretNumber}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                >
                  <Check className="mr-2" size={18} />
                  Confirmar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Pantalla de fin del juego
  if (room.status === 'finished') {
    const winner = gameData.winner;
    const isWinner = winner === currentPlayer.id;
    const winningGuess = isWinner 
      ? myData.guesses[myData.guesses.length - 1]
      : opponentData?.guesses[opponentData.guesses.length - 1];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] p-4"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 15 }}
          className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 ${
            isWinner ? 'bg-gradient-to-br from-yellow-400 to-amber-600' : 'bg-gradient-to-br from-slate-500 to-slate-700'
          }`}
        >
          <Trophy size={60} className="text-white" />
        </motion.div>

        <h2 className="text-4xl font-bold text-white mb-2">
          {isWinner ? '¡Ganaste!' : '¡Juego Terminado!'}
        </h2>

        <p className="text-slate-400 text-lg mb-4">
          {isWinner 
            ? `¡Adivinaste el número en ${myData.guesses.length} intentos!`
            : `${opponentData?.name} adivinó tu número en ${opponentData?.guesses.length} intentos`}
        </p>

        {winningGuess && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-emerald-500/20 border-2 border-emerald-500 rounded-xl p-6 mb-8"
          >
            <p className="text-emerald-400 text-sm mb-1">Número correcto</p>
            <p className="text-5xl font-bold text-white">{winningGuess.number}</p>
          </motion.div>
        )}

        {/* Solo dejamos que el creador de la sala reinicie el juego */}
        {currentPlayer.isHost && (
          <Button
            onClick={onReset}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-6 text-lg"
          >
            <RotateCcw className="mr-2" size={20} />
            Jugar de Nuevo
          </Button>
        )}
      </motion.div>
    );
  }

  // Pantalla principal del juego
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="grid grid-cols-2 gap-4">
          {players.map(([id, data], index) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-2xl ${
                gameData.currentTurn === id
                  ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border-2 border-emerald-500'
                  : 'bg-slate-700/50 border-2 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  id === currentPlayer.id ? 'bg-indigo-500' : 'bg-purple-500'
                }`}>
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

      {/* Área de juego dividida */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mi lado - Mis intentos */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-emerald-900/40 to-teal-800/30 rounded-3xl p-6 border-2 border-emerald-700/50"
        >
          <h3 className="text-emerald-400 font-semibold mb-4 flex items-center gap-2">
            <Target size={18} />
            Tus Intentos
          </h3>

          {/* Mi número secreto */}
          <div className="bg-emerald-950/50 rounded-xl p-4 mb-4">
            <p className="text-emerald-400/70 text-sm mb-2">Tu número secreto</p>
            <div className="flex items-center gap-3">
              <Lock size={20} className="text-emerald-500" />
              <span className="text-3xl font-bold text-emerald-400">{myData?.secretNumber}</span>
            </div>
          </div>

          {/* Lista de intentos */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {myData?.guesses.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                Aún no has hecho ningún intento
              </p>
            ) : (
              myData?.guesses.map((guess, idx) => (
                <GuessRow key={idx} guess={guess} index={idx} />
              ))
            )}
          </div>

          {/* Input para adivinar */}
          {isMyTurn && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 pt-4 border-t border-emerald-700/30"
            >
              <p className="text-emerald-400 text-sm mb-3">Ingresa tu intento (1-100)</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={guessInput}
                  onChange={(e) => setGuessInput(e.target.value ? parseInt(e.target.value) : '')}
                  className="bg-slate-700/50 border-emerald-600 text-white text-center text-xl"
                  placeholder="?"
                  autoFocus
                />
                <Button
                  onClick={submitGuess}
                  disabled={!guessInput || guessInput < 1 || guessInput > 100}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6"
                >
                  <ArrowUp className="mr-1" size={16} />
                  Adivinar
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Lado del oponente */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-purple-900/40 to-pink-800/30 rounded-3xl p-6 border-2 border-purple-700/50"
        >
          <h3 className="text-purple-400 font-semibold mb-4 flex items-center gap-2">
            <User size={18} />
            Intentos de {opponentData?.name}
          </h3>

          {/* Número secreto del oponente (oculto) */}
          <div className="bg-purple-950/50 rounded-xl p-4 mb-4">
            <p className="text-purple-400/70 text-sm mb-2">Número secreto de {opponentData?.name}</p>
            <div className="flex items-center gap-3">
              <Lock size={20} className="text-purple-500" />
              <span className="text-3xl font-bold text-purple-400">???</span>
            </div>
          </div>

          {/* Lista de intentos del oponente */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {opponentData?.guesses.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                {opponentData?.name} aún no ha hecho ningún intento
              </p>
            ) : (
              opponentData?.guesses.map((guess, idx) => (
                <GuessRow key={idx} guess={guess} index={idx} isOpponent />
              ))
            )}
          </div>

          {/* Estado del turno */}
          <div className="mt-4 pt-4 border-t border-purple-700/30">
            <div className="flex items-center justify-center gap-2 text-purple-300">
              {gameData.currentTurn !== currentPlayer.id ? (
                <>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  <span>Esperando a {opponentData?.name}...</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span>¡Es tu turno de adivinar!</span>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
