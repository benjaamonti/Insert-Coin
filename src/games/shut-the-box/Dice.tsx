import { motion } from 'framer-motion';

interface DiceProps {
  value: number;
  rolling?: boolean;
}

const dotPositions: { [key: number]: string[] } = {
  1: ['center'],
  2: ['top-left', 'bottom-right'],
  3: ['top-left', 'center', 'bottom-right'],
  4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
  5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
  6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right']
};

export function Dice({ value, rolling = false }: DiceProps) {
  const positions = dotPositions[value] || [];

  return (
    <motion.div
      animate={rolling ? {
        rotateX: [0, 360, 720],
        rotateY: [0, 180, 360]
      } : {}}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="relative w-16 h-16 md:w-20 md:h-20"
      style={{ perspective: '1000px' }}
    >
      <div className={`
        w-full h-full rounded-xl shadow-2xl
        bg-gradient-to-br from-white to-gray-200
        border-2 border-gray-300
        flex items-center justify-center
        relative overflow-hidden
      `}>
        {/* Brillo */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/50 to-transparent rounded-xl" />
        
        {/* Puntos */}
        <div className="relative w-full h-full p-2">
          {positions.map((pos, idx) => (
            <div
              key={idx}
              className={`
                absolute w-3 h-3 md:w-4 md:h-4 rounded-full
                bg-gradient-to-br from-gray-800 to-black
                shadow-inner
                ${pos === 'center' && 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'}
                ${pos === 'top-left' && 'top-2 left-2 md:top-3 md:left-3'}
                ${pos === 'top-right' && 'top-2 right-2 md:top-3 md:right-3'}
                ${pos === 'middle-left' && 'top-1/2 left-2 md:left-3 -translate-y-1/2'}
                ${pos === 'middle-right' && 'top-1/2 right-2 md:right-3 -translate-y-1/2'}
                ${pos === 'bottom-left' && 'bottom-2 left-2 md:bottom-3 md:left-3'}
                ${pos === 'bottom-right' && 'bottom-2 right-2 md:bottom-3 md:right-3'}
              `}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
