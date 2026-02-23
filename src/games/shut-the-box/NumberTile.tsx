import { motion } from 'framer-motion';

interface NumberTileProps {
  number: number;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
}

export function NumberTile({ number, selected, onClick, disabled }: NumberTileProps) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`
        aspect-square rounded-lg flex items-center justify-center
        text-lg md:text-xl font-bold transition-all duration-200
        ${selected 
          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 border-2 border-emerald-400' 
          : disabled
            ? 'bg-amber-900/40 text-amber-700/50 border-2 border-amber-800/30 cursor-not-allowed'
            : 'bg-gradient-to-br from-amber-700 to-amber-800 text-amber-100 border-2 border-amber-600 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/20 cursor-pointer'
        }
      `}
    >
      <span className={`
        ${selected ? 'drop-shadow-md' : ''}
      `}>
        {number}
      </span>
    </motion.button>
  );
}
