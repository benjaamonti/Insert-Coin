import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface PlayerSetupProps {
  onSubmit: (name: string) => void;
  defaultName?: string;
}

export function PlayerSetup({ onSubmit, defaultName = '' }: PlayerSetupProps) {
  const [name, setName] = useState(defaultName);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Por favor ingresa tu nombre');
      return;
    }
    if (trimmedName.length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      return;
    }
    if (trimmedName.length > 20) {
      setError('El nombre no puede tener más de 20 caracteres');
      return;
    }
    
    onSubmit(trimmedName);
  };

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
            <User size={32} className="text-white" />
          </motion.div>
          <CardTitle className="text-2xl text-white">¡Bienvenido!</CardTitle>
          <CardDescription className="text-slate-400">
            Ingresa tu nombre para comenzar a jugar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 pl-4 pr-4 py-6 text-lg"
                maxLength={20}
                autoFocus
              />
            </div>
            
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-red-400 text-sm text-center"
              >
                {error}
              </motion.p>
            )}
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-6 text-lg font-semibold"
            >
              <Sparkles className="mr-2" size={20} />
              Comenzar
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
