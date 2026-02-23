import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, set, update, get, remove } from 'firebase/database';
import { db } from '@/config/firebase';
import type { Room, Player, GameType, ShutTheBoxData, GuessNumberData } from '@/types';

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export function useRoom(roomCode: string | null, player: Player | null) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomCode) {
      setRoom(null);
      setLoading(false);
      return;
    }

    const roomRef = ref(db, `rooms/${roomCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoom(data as Room);
      } else {
        setRoom(null);
        setError('Sala no encontrada');
      }
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomCode]);

  const createRoom = useCallback(async (gameType: GameType, hostPlayer: Player): Promise<string> => {
    const code = generateRoomCode();
    const newRoom: Room = {
      id: code,
      code,
      gameType,
      players: [hostPlayer],
      status: 'waiting',
      createdAt: Date.now(),
    };

    await set(ref(db, `rooms/${code}`), newRoom);
    return code;
  }, []);

  const joinRoom = useCallback(async (code: string, joiningPlayer: Player): Promise<boolean> => {
    const roomRef = ref(db, `rooms/${code}`);
    const snapshot = await get(roomRef);
    
    if (!snapshot.exists()) {
      setError('Sala no encontrada');
      return false;
    }

    const roomData = snapshot.val() as Room;
    
    if (roomData.players.length >= 2) {
      setError('La sala está llena');
      return false;
    }

    if (roomData.players.find(p => p.id === joiningPlayer.id)) {
      return true;
    }

    const updatedPlayers = [...roomData.players, joiningPlayer];
    await update(roomRef, { players: updatedPlayers });
    return true;
  }, []);

  const leaveRoom = useCallback(async () => {
    if (!roomCode || !player) return;

    const roomRef = ref(db, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    
    if (snapshot.exists()) {
      const roomData = snapshot.val() as Room;
      const updatedPlayers = roomData.players.filter(p => p.id !== player.id);
      
      if (updatedPlayers.length === 0) {
        await remove(roomRef);
      } else {
        await update(roomRef, { players: updatedPlayers });
      }
    }
  }, [roomCode, player]);

  const startGame = useCallback(async (initialData: ShutTheBoxData | GuessNumberData) => {
    if (!roomCode) return;

    const roomRef = ref(db, `rooms/${roomCode}`);
    await update(roomRef, {
      status: 'playing',
      gameData: initialData
    });
  }, [roomCode]);

  const updateGameData = useCallback(async (gameData: ShutTheBoxData | GuessNumberData) => {
    if (!roomCode) return;

    const roomRef = ref(db, `rooms/${roomCode}`);
    await update(roomRef, { gameData });
  }, [roomCode]);

  const endGame = useCallback(async (winnerId?: string) => {
    if (!roomCode) return;

    const roomRef = ref(db, `rooms/${roomCode}`);
    await update(roomRef, {
      status: 'finished',
      'gameData/winner': winnerId || null
    });
  }, [roomCode]);

  const resetRoom = useCallback(async () => {
    if (!roomCode) return;

    const roomRef = ref(db, `rooms/${roomCode}`);
    await update(roomRef, {
      status: 'waiting',
      gameData: null
    });
  }, [roomCode]);

  return {
    room,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    updateGameData,
    endGame,
    resetRoom
  };
}
