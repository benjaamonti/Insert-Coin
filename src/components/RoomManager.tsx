import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, LogIn, Copy, Check, Users, ArrowLeft, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { GameType } from '@/types';

interface RoomManagerProps {
  onCreateRoom: (gameType: GameType) => void;
  onJoinRoom: (code: string) => void;
  roomCode: string | null;
  onBack: () => void;
}

export function RoomManager({ onCreateRoom, onJoinRoom, roomCode, onBack }: RoomManagerProps) {
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

  if (roomCode) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center min-h-[60vh] p-4"
      >
        <Card className="w-full max-w-md bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-2xl">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4"
            >
              <Users size={32} className="text-white" />
            </motion.div>
            <CardTitle className="text-2xl text-white">¡Sala Creada!</CardTitle>
            <CardDescription className="text-slate-400">
              Comparte este código con tu amigo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <div className="bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-xl p-6 text-center">
                <p className="text-slate-400 text-sm mb-2">Código de la sala</p>
                <p className="text-4xl font-mono font-bold text-white tracking-wider">
                  {roomCode}
                </p>
              </div>
              <Button
                onClick={copyCode}
                variant="outline"
                className="absolute top-2 right-2 bg-slate-800 border-slate-600 hover:bg-slate-700"
                size="sm"
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-slate-400">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm">Esperando al segundo jugador...</span>
            </div>

            <Button
              onClick={onBack}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <ArrowLeft className="mr-2" size={18} />
              Volver
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-[60vh] p-4"
    >
      <Card className="w-full max-w-md bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-2xl">
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4"
          >
            <Gamepad2 size={32} className="text-white" />
          </motion.div>
          <CardTitle className="text-2xl text-white">Unirse a una Partida</CardTitle>
          <CardDescription className="text-slate-400">
            Crea una nueva sala o únete a una existente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
              <TabsTrigger value="create" className="data-[state=active]:bg-slate-600">
                <Plus className="mr-2" size={16} />
                Crear
              </TabsTrigger>
              <TabsTrigger value="join" className="data-[state=active]:bg-slate-600">
                <LogIn className="mr-2" size={16} />
                Unirse
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Selecciona un juego</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedGame('shut-the-box')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedGame === 'shut-the-box'
                        ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                        : 'border-slate-600 bg-slate-700/30 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <p className="font-semibold text-sm">Shut the Box</p>
                    <p className="text-xs opacity-70">Dados</p>
                  </button>
                  <button
                    onClick={() => setSelectedGame('guess-number')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedGame === 'guess-number'
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                        : 'border-slate-600 bg-slate-700/30 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <p className="font-semibold text-sm">Adivina el Número</p>
                    <p className="text-xs opacity-70">Lógica</p>
                  </button>
                </div>
              </div>

              <Button
                onClick={handleCreateRoom}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-5"
              >
                <Plus className="mr-2" size={18} />
                Crear Sala
              </Button>
            </TabsContent>

            <TabsContent value="join" className="space-y-4 mt-4">
              <form onSubmit={handleJoinRoom}>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">
                      Código de la sala
                    </label>
                    <Input
                      type="text"
                      placeholder="ABCDEF"
                      value={joinCode}
                      onChange={(e) => {
                        setJoinCode(e.target.value.toUpperCase());
                        setError('');
                      }}
                      className="bg-slate-700/50 border-slate-600 text-white text-center text-2xl tracking-wider font-mono py-6"
                      maxLength={6}
                    />
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-400 text-sm text-center"
                    >
                      {error}
                    </motion.p>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-5"
                  >
                    <LogIn className="mr-2" size={18} />
                    Unirse a la Sala
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>

          <Button
            onClick={onBack}
            variant="outline"
            className="w-full mt-4 border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <ArrowLeft className="mr-2" size={18} />
            Volver
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
