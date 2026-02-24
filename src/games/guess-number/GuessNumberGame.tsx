import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Check, RotateCcw, Trophy, Lock, User, Target, LogOut } from 'lucide-react';
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
  onGoHome: () => void; // NUEVO
}

export function GuessNumberGame({ room, currentPlayer, onUpdateGame, onEndGame, onReset, onGoHome }: GuessNumberGameProps) {
  const gameData = room.gameData as GuessNumberData;

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

  const myGuesses = myData.guesses || [];
  const opponentGuesses = opponentData?.guesses || [];

  const displayPlayers = [
    { id: currentPlayer.id, data: myData },
    ...(opponentId && opponentData ? [{ id: opponentId, data: opponentData }] : [])
  ];

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

    if (opponentData && opponentData.hasSetNumber) {
      newGameData.phase = 'playing';
    }

    onUpdateGame(newGameData);
    setShowSecretInput(false);
  };

  const submitGuess = () => {
    if (guessInput === '' || !opponentId) return;

    const guess = guessInput as number;
    const opponentSecret = gameData.players[opponentId].secretNumber;
    
    if (opponentSecret == null) return;

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
          guesses: [...myGuesses, newGuess]
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

  if (gameData.phase === 'setup' || !myData?.hasSetNumber) {
    if (myData?.hasSetNumber) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] p-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6">
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
              const newGameData: GuessNumberData = {
                ...gameData,
                players: {
                  ...gameData.players,
                  [currentPlayer.id]: { ...myData, hasSetNumber: false, secretNumber: null }
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

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6">
          <Lock size={48} className="text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Elige tu Número Secreto</h2>
        <p className="text-slate-400 text-center mb-8 max-w-md">
          Selecciona un número del 1 al 100. Tu oponente intentará adivinarlo. ¡No se lo reveles!
        </p>
        <AnimatePresence mode="wait">
          {!showSecretInput ? (
            <motion.div key="selector" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <NumberSelector value={secretNumber as number} onChange={setSecretNumber} onConfirm={() => setShowSecretInput(true)} />
            </motion.div>
          ) : (
            <motion.div key="confirm" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-slate-800 rounded-2xl p-8 text-center">
              <p className="text-slate-400 mb-4">Tu número secreto es:</p>
              <p className="text-6xl font-bold text-emerald-400 mb-6">{secretNumber}</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowSecretInput(false)} className="border-slate-600 text-slate-300">Cambiar</Button>
                <Button onClick={submitSecretNumber} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                  <Check className="mr-2" size={18} /> Confirmar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Lógica de PANTALLA FINAL y VOTACIÓN
  if (room.status === 'finished') {
    const winner = gameData.winner;
    if (!winner) return null;

    const isWinner = winner === currentPlayer.id;
    const loserId = winner === currentPlayer.id ? opponentId : currentPlayer.id;

    // Control de votos y salidas
    const opponentLeft = room.players.length < 2;
    const votes = gameData.playAgainVotes || [];
    const hasVoted = votes.includes(currentPlayer.id);

    const handlePlayAgain = () => {
      if (votes.length === 1 && !hasVoted) {
        onReset(); // El otro ya votó, iniciamos directo
      } else {
        onUpdateGame({
          ...gameData,
          playAgainVotes: [...votes, currentPlayer.id]
        });
      }
    };

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 15 }} className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 ${isWinner ? 'bg-gradient-to-br from-yellow-400 to-amber-600' : 'bg-gradient-to-br from-slate-500 to-slate-700'}`}>
          <Trophy size={60} className="text-white" />
        </motion.div>
        <h2 className="text-4xl font-bold text-white mb-2">{isWinner ? '¡Ganaste!' : '¡Juego Terminado!'}</h2>
        <p className="text-slate-400 text-lg mb-8 text-center">
          {isWinner ? `¡Adivinaste el número en ${myGuesses.length} intentos!` : `${opponentData?.name || 'El oponente'} adivinó tu número en ${opponentGuesses.length} intentos`}
        </p>

        <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} className="bg-emerald-500/20 border-2 border-emerald-500 rounded-xl p-6 flex flex-col items-center justify-center text-center">
            <p className="text-emerald-400 text-sm mb-1">{isWinner ? 'Tu número' : `Número de ${gameData.players[winner]?.name || 'Ganador'}`}</p>
            <p className="text-5xl font-bold text-white">{gameData.players[winner]?.secretNumber}</p>
          </motion.div>

          {loserId && gameData.players[loserId] && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }} className="bg-slate-700/50 border-2 border-slate-600 rounded-xl p-6 flex flex-col items-center justify-center text-center">
              <p className="text-slate-400 text-sm mb-1">{!isWinner ? 'Tu número' : `Número de ${gameData.players[loserId].name}`}</p>
              <p className="text-5xl font-bold text-slate-300">{gameData.players[loserId].secretNumber}</p>
            </motion.div>
          )}
        </div>

        {/* CONTROLES DE FIN DE PARTIDA */}
        <div className="flex flex-col gap-4 mt-2 w-full max-w-sm">
          {opponentLeft ? (
            <div className="text-center space-y-4">
              <p className="text-amber-400 font-semibold bg-amber-500/10 py-3 rounded-lg border border-amber-500/20">
                El oponente abandonó la sala.
              </p>
              <Button onClick={onGoHome} className="w-full bg-slate-700 hover:bg-slate-600 text-white py-6 text-lg">
                <LogOut className="mr-2" size={20} />
                Volver al Inicio
              </Button>
            </div>
          ) : hasVoted ? (
            <div className="text-center space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 py-3 rounded-lg">
                <p className="text-emerald-400 font-semibold flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  Esperando a que el oponente acepte...
                </p>
              </div>
              <Button onClick={onGoHome} variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 py-6 text-lg">
                <LogOut className="mr-2" size={20} />
                Salir al Inicio
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Button onClick={handlePlayAgain} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-6 text-lg">
                <RotateCcw className="mr-2" size={20} />
                Jugar de Nuevo
              </Button>
              <Button onClick={onGoHome} variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 py-6 text-lg">
                <LogOut className="mr-2" size={20} />
                Volver al Inicio
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto mb-6">
        <div className="grid grid-cols-2 gap-4">
          {displayPlayers.map(({ id, data }, index) => (
            <motion.div key={id} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className={`p-4 rounded-2xl ${gameData.currentTurn === id ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border-2 border-emerald-500' : 'bg-slate-700/50 border-2 border-transparent'}`}>
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
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="bg-gradient-to-br from-emerald-900/40 to-teal-800/30 rounded-3xl p-6 border-2 border-emerald-700/50">
          <h3 className="text-emerald-400 font-semibold mb-4 flex items-center gap-2">
            <Target size={18} /> Tus Intentos
          </h3>
          <div className="bg-emerald-950/50 rounded-xl p-4 mb-4">
            <p className="text-emerald-400/70 text-sm mb-2">Tu número secreto</p>
            <div className="flex items-center gap-3">
              <Lock size={20} className="text-emerald-500" />
              <span className="text-3xl font-bold text-emerald-400">{myData?.secretNumber}</span>
            </div>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
            {myGuesses.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Aún no has hecho ningún intento</p>
            ) : (
              myGuesses.map((guess, idx) => <GuessRow key={idx} guess={guess} index={idx} />)
            )}
          </div>
          {isMyTurn && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4 pt-4 border-t border-emerald-700/30">
              <p className="text-emerald-400 text-sm mb-3">Ingresa tu intento (1-100)</p>
              <div className="flex gap-2">
                <Input type="number" min={1} max={100} value={guessInput} onChange={(e) => setGuessInput(e.target.value ? parseInt(e.target.value) : '')} className="bg-slate-700/50 border-emerald-600 text-white text-center text-xl" placeholder="?" autoFocus />
                <Button onClick={submitGuess} disabled={!guessInput || guessInput < 1 || guessInput > 100} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6">
                  <ArrowUp className="mr-1" size={16} /> Adivinar
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="bg-gradient-to-br from-purple-900/40 to-pink-800/30 rounded-3xl p-6 border-2 border-purple-700/50">
          <h3 className="text-purple-400 font-semibold mb-4 flex items-center gap-2">
            <User size={18} /> Intentos de {opponentData?.name}
          </h3>
          <div className="bg-purple-950/50 rounded-xl p-4 mb-4">
            <p className="text-purple-400/70 text-sm mb-2">Número secreto de {opponentData?.name}</p>
            <div className="flex items-center gap-3">
              <Lock size={20} className="text-purple-500" />
              <span className="text-3xl font-bold text-purple-400">???</span>
            </div>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
            {opponentGuesses.length === 0 ? (
              <p className="text-slate-500 text-center py-8">{opponentData?.name} aún no ha hecho ningún intento</p>
            ) : (
              opponentGuesses.map((guess, idx) => <GuessRow key={idx} guess={guess} index={idx} isOpponent />)
            )}
          </div>
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
