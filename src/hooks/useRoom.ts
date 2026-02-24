import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, set, update, get, remove, onDisconnect } from 'firebase/database';
import { db } from '@/config/firebase';
import type { Room, Player, GameType, ShutTheBoxData, GuessNumberData } from '@/types';

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export function useRoom(roomCode: string | null, player: Player | null) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Escuchar cambios en la sala
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

  // Lógica de inactividad, limpieza automática y latidos (pings)
  useEffect(() => {
    if (!roomCode || !player) return;

    const pingRef = ref(db, `rooms/${roomCode}/pings/${player.id}`);
    
    // Si el usuario cierra el navegador de golpe, Firebase borra su ping automáticamente
    onDisconnect(pingRef).remove();

    // Enviar un latido cada 30 segundos
    const pingInterval = setInterval(() => {
      set(pingRef, Date.now());
    }, 30000);
    // Ejecutar el primer ping inmediatamente
    set(pingRef, Date.now());

    // Revisar la inactividad cada 1 minuto
    const checkInterval = setInterval(async () => {
      const roomRef = ref(db, `rooms/${roomCode}`);
      const snapshot = await get(roomRef);
      if (!snapshot.exists()) return;
      
      const data = snapshot.val() as Room;
      const now = Date.now();
      const lastAct = data.lastActivity || data.createdAt;

      // REGLA 1: Borrar si pasaron 15 minutos sin movimientos
      if (now - lastAct > 15 * 60 * 1000) {
        await remove(roomRef);
        return;
      }

      // REGLA 2: Borrar si pasaron 2 minutos sin jugadores conectados (pings)
      const pings = data.pings || {};
      const activePlayers = Object.values(pings).filter((time: any) => now - time < 2 * 60 * 1000);
      
      // Se dan 2 minutos de gracia desde que se crea la sala antes de aplicar esta regla
      if (activePlayers.length === 0 && now - data.createdAt > 2 * 60 * 1000) {
        await remove(roomRef);
      }
    }, 60000);

    return () => {
      clearInterval(pingInterval);
      clearInterval(checkInterval);
    };
  }, [roomCode, player]);

  const createRoom = useCallback(async (gameType: GameType, hostPlayer: Player): Promise<string> => {
    const code = generateRoomCode();
    const now = Date.now();
    const newRoom: Room = {
      id: code,
      code,
      gameType,
      players: [hostPlayer],
      status: 'waiting',
      createdAt: now,
      lastActivity: now,
      pings: {
        [hostPlayer.id]: now
      }
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
    await update(roomRef, { 
      players: updatedPlayers,
      lastActivity: Date.now(),
      [`pings/${joiningPlayer.id}`]: Date.now()
    });
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
        const pingRef = ref(db, `rooms/${roomCode}/pings/${player.id}`);
        await remove(pingRef);
      }
    }
  }, [roomCode, player]);

  // NUEVA FUNCIÓN: Abandonar partida
  const abandonGame = useCallback(async () => {
    if (!roomCode || !player) return;

    const roomRef = ref(db, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    
    if (snapshot.exists()) {
      const roomData = snapshot.val() as Room;
      const opponent = roomData.players.find(p => p.id !== player.id);
      
      if (opponent && roomData.status === 'playing') {
        // Hacemos que el oponente gane automáticamente
        await update(roomRef, {
          status: 'finished',
          'gameData/winner': opponent.id,
          lastActivity: Date.now()
        });
      } else {
        // Si no hay oponente o no han empezado, solo sale de la sala
        await leaveRoom();
      }
    }
  }, [roomCode, player, leaveRoom]);

  const startGame = useCallback(async (initialData: ShutTheBoxData | GuessNumberData) => {
    if (!roomCode) return;

    const roomRef = ref(db, `rooms/${roomCode}`);
    await update(roomRef, {
      status: 'playing',
      gameData: initialData,
      lastActivity: Date.now()
    });
  }, [roomCode]);

  const updateGameData = useCallback(async (gameData: ShutTheBoxData | GuessNumberData) => {
    if (!roomCode) return;

    const roomRef = ref(db, `rooms/${roomCode}`);
    await update(roomRef, { 
      gameData,
      lastActivity: Date.now() // Refrescamos los 15 min al hacer un movimiento
    });
  }, [roomCode]);

  const endGame = useCallback(async (winnerId?: string) => {
    if (!roomCode) return;

    const roomRef = ref(db, `rooms/${roomCode}`);
    await update(roomRef, {
      status: 'finished',
      'gameData/winner': winnerId || null,
      lastActivity: Date.now()
    });
  }, [roomCode]);

  const resetRoom = useCallback(async () => {
    if (!roomCode) return;

    const roomRef = ref(db, `rooms/${roomCode}`);
    await update(roomRef, {
      status: 'waiting',
      gameData: null,
      lastActivity: Date.now()
    });
  }, [roomCode]);

  return {
    room,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    abandonGame,
    startGame,
    updateGameData,
    endGame,
    resetRoom
  };
}
