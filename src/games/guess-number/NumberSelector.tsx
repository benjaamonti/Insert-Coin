import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NumberSelectorProps {
  value: number;
  onChange: (value: number) => void;
  onConfirm: () => void;
}

export function NumberSelector({ value, onChange, onConfirm }: NumberSelectorProps) {
  const [tempValue, setTempValue] = useState(value || 50);

  const increment = () => {
    const newValue = Math.min(tempValue + 1, 100);
    setTempValue(newValue);
    onChange(newValue);
  };

  const decrement = () => {
    const newValue = Math.max(tempValue - 1, 1);
    setTempValue(newValue);
    onChange(newValue);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setTempValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="bg-slate-800 rounded-3xl p-8 text-center">
      {/* Controles arriba/abajo */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={increment}
          className="w-16 h-16 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors"
        >
          <ChevronUp size={32} className="text-emerald-400" />
        </motion.button>

        <motion.div
          key={tempValue}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-7xl font-bold text-white w-40"
        >
          {tempValue}
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={decrement}
          className="w-16 h-16 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors"
        >
          <ChevronDown size={32} className="text-emerald-400" />
        </motion.button>
      </div>

      {/* Slider */}
      <div className="mb-6">
        <input
          type="range"
          min={1}
          max={100}
          value={tempValue}
          onChange={handleSliderChange}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>1</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      <Button
        onClick={onConfirm}
        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-5 text-lg"
      >
        <Check className="mr-2" size={20} />
        Elegir {tempValue}
      </Button>
    </div>
  );
}
