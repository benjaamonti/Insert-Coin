import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Dices, Brain, Home, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GameConfig, GameType } from '@/types';

const games: GameConfig[] = [
  {
    id: 'shut-the-box',
    name: 'Shut the Box',
    description: 'Tira los dados y elimina números. El primero en limpiar su tabla gana.',
    minPlayers: 2,
    maxPlayers: 2,
    icon: 'dices',
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'guess-number',
    name: 'Adivina el Número',
    description: 'Elige un número secreto y adivina el de tu oponente.',
    minPlayers: 2,
    maxPlayers: 2,
    icon: 'brain',
    color: 'from-emerald-500 to-teal-600'
  }
];

interface SidebarProps {
  currentGame: GameType | null;
  onSelectGame: (game: GameType) => void;
  onGoHome: () => void;
}

export function Sidebar({ currentGame, onSelectGame, onGoHome }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const handleGameSelect = (gameId: GameType) => {
    onSelectGame(gameId);
    closeSidebar();
  };

  const handleGoHome = () => {
    onGoHome();
    closeSidebar();
  };

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-3 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        aria-label="Toggle menu"
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.div>
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 z-40 shadow-2xl"
      >
        <div className="p-6 pt-20">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              GameHub
            </h1>
            <p className="text-slate-400 text-sm mt-1">Multijugador</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-3">
            <Button
              variant="ghost"
              onClick={handleGoHome}
              className={`w-full justify-start gap-3 text-left ${
                !currentGame ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Home size={20} />
              <span>Inicio</span>
            </Button>

            <div className="pt-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
                Juegos Disponibles
              </h3>
              <div className="space-y-2">
                {games.map((game) => (
                  <motion.button
                    key={game.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleGameSelect(game.id)}
                    className={`w-full p-3 rounded-xl text-left transition-all duration-200 ${
                      currentGame === game.id
                        ? 'bg-gradient-to-r ' + game.color + ' text-white shadow-lg'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        currentGame === game.id ? 'bg-white/20' : 'bg-slate-700'
                      }`}>
                        {game.icon === 'dices' && <Dices size={18} />}
                        {game.icon === 'brain' && <Brain size={18} />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{game.name}</p>
                        <p className="text-xs opacity-80 flex items-center gap-1">
                          <Users size={10} />
                          {game.minPlayers}-{game.maxPlayers} jugadores
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </nav>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center">
            Crea una sala e invita a tus amigos
          </p>
        </div>
      </motion.aside>
    </>
  );
}
