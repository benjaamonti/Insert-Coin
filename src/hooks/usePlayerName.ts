import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'gamehub_player_name';
const PLAYER_ID_KEY = 'gamehub_player_id';

export function usePlayerName() {
  const [playerName, setPlayerName] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem(STORAGE_KEY);
    let storedId = localStorage.getItem(PLAYER_ID_KEY);
    
    if (!storedId) {
      storedId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem(PLAYER_ID_KEY, storedId);
    }
    
    setPlayerId(storedId);
    if (storedName) {
      setPlayerName(storedName);
    }
    setIsLoaded(true);
  }, []);

  const savePlayerName = useCallback((name: string) => {
    const trimmedName = name.trim();
    if (trimmedName) {
      localStorage.setItem(STORAGE_KEY, trimmedName);
      setPlayerName(trimmedName);
    }
  }, []);

  const clearPlayerName = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPlayerName('');
  }, []);

  return {
    playerName,
    playerId,
    isLoaded,
    savePlayerName,
    clearPlayerName,
    hasName: !!playerName
  };
}
