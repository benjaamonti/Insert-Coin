import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, LogIn, Copy, Check, Users, ArrowLeft, Dices, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { GameType } from '@/types';

interface RoomManagerProps {
  initialAction: 'create' | 'join';
  onCreateRoom: (gameType: GameType) => void;
  onJoinRoom: (code: string) => void;
  roomCode: string | null;
  onBack: () => void;
}

export function RoomManager({ initialAction, onCreateRoom, onJoinRoom, roomCode, onBack }: RoomManagerProps) {
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [selectedGame, setSelectedGame] = useState<GameType>('shut-the-box');

  const handleCreateRoom = () => {
    onCreateRoom(selectedGame);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 6) {
      setError('El código debe tener 6 caracteres');
      return;
    }
    onJoinRoom(code);
  };

  const copyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Pantalla de espera (Sala Creada)
  if (roomCode) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="w-full max-w-md bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-2xl">
          <CardHeader className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
              <Users size={32} className="text-white" />
            </motion.div>
            <CardTitle className="text-2xl text-white">¡Sala Creada!</CardTitle>
            <CardDescription className="text-slate-400">Comparte este código con tu amigo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <div className="bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-xl p-6 text-center">
                <p className="text-slate-400 text-sm mb-2">Código de la sala</p>
                <p className="text-4xl font-mono font-bold text-white tracking-wider">{roomCode}</p>
              </div>
              <Button onClick={copyCode} variant="outline" className="absolute top-2 right-2 bg-slate-800 border-slate-600 hover:bg-slate-700" size="sm">
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </Button>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm">Esperando al segundo jugador...</span>
            </div>
            <Button onClick={onBack} variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
              <ArrowLeft className="mr-2" size={18} /> Cancelar y Volver
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Pantallas de Crear / Unirse
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-2xl">
        <CardHeader className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${initialAction === 'create' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'}`}>
            {initialAction === 'create' ? <Plus size={32} className="text-white" /> : <LogIn size={32} className="text-white" />}
          </motion.div>
          <CardTitle className="text-2xl text-white">
            {initialAction === 'create' ? 'Crear Nueva Sala' : 'Unirse a la Sala'}
          </CardTitle>
          <CardDescription className="text-slate-400">
            {initialAction === 'create' ? 'Selecciona a qué quieres jugar' : 'Ingresa el código para jugar'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          
          {initialAction === 'create' ? (
            <div className="space-y-6 mt-2">
              <div className="space-y-3">
                <button onClick={() => setSelectedGame('shut-the-box')} className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${selectedGame === 'shut-the-box' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}>
                  <div className={`p-3 rounded-lg ${selectedGame === 'shut-the-box' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                    <Dices size={24} />
                  </div>
                  <div>
                    <h3 className={`font-bold ${selectedGame === 'shut-the-box' ? 'text-amber-400' : 'text-slate-300'}`}>Shut the Box</h3>
                    <p className="text-sm text-slate-500">Juego de dados y matemáticas</p>
                  </div>
                </button>

                <button onClick={() => setSelectedGame('guess-number')} className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${selectedGame === 'guess-number' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}>
                  <div className={`p-3 rounded-lg ${selectedGame === 'guess-number' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                    <Target size={24} />
                  </div>
                  <div>
                    <h3 className={`font-bold ${selectedGame === 'guess-number' ? 'text-emerald-400' : 'text-slate-300'}`}>Adivina el Número</h3>
                    <p className="text-sm text-slate-500">Juego de lógica y deducción</p>
                  </div>
                </button>
              </div>

              <Button onClick={handleCreateRoom} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-6 text-lg">
                Generar Código
              </Button>
            </div>
          ) : (
            <form onSubmit={handleJoinRoom} className="space-y-6 mt-2">
              <div>
                <Input
                  type="text"
                  placeholder="ABCDEF"
                  value={joinCode}
                  onChange={(e) => {
                    setJoinCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  className="bg-slate-700/50 border-slate-600 text-white text-center text-3xl tracking-[0.5em] font-mono py-8 uppercase placeholder:text-slate-500"
                  maxLength={6}
                  autoFocus
                />
                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm text-center mt-2">
                    {error}
                  </motion.p>
                )}
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-6 text-lg">
                <LogIn className="mr-2" size={20} /> Entrar a la Sala
              </Button>
            </form>
          )}

          <Button onClick={onBack} variant="outline" className="w-full mt-4 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white">
            <ArrowLeft className="mr-2" size={18} /> Volver
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
