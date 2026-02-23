import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Check } from 'lucide-react';
import type { Guess } from '@/types';

interface GuessRowProps {
  guess: Guess;
  index: number;
  isOpponent?: boolean;
}

export function GuessRow({ guess, index, isOpponent = false }: GuessRowProps) {
  const getHintIcon = () => {
    switch (guess.hint) {
      case 'higher':
        return <ArrowUp size={20} />;
      case 'lower':
        return <ArrowDown size={20} />;
      case 'correct':
        return <Check size={20} />;
    }
  };

  const getHintColor = () => {
    switch (guess.hint) {
      case 'higher':
        return 'bg-amber-500 text-white';
      case 'lower':
        return 'bg-blue-500 text-white';
      case 'correct':
        return 'bg-emerald-500 text-white';
    }
  };

  const getHintText = () => {
    switch (guess.hint) {
      case 'higher':
        return 'Más alto';
      case 'lower':
        return 'Más bajo';
      case 'correct':
        return '¡Correcto!';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: isOpponent ? 30 : -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        flex items-center gap-3 p-3 rounded-xl
        ${isOpponent ? 'bg-purple-800/30' : 'bg-emerald-800/30'}
      `}
    >
      <span className="text-slate-500 text-sm font-mono w-6">#{index + 1}</span>
      
      <div className={`
        flex-1 flex items-center justify-between gap-3
        ${isOpponent ? 'flex-row-reverse' : ''}
      `}>
        <span className={`
          text-2xl font-bold
          ${isOpponent ? 'text-purple-300' : 'text-emerald-300'}
        `}>
          {guess.number}
        </span>
        
        <div className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
          ${getHintColor()}
        `}>
          {getHintIcon()}
          <span>{getHintText()}</span>
        </div>
      </div>
    </motion.div>
  );
}
