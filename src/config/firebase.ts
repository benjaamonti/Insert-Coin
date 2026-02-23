import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForGameHub123456789",
  authDomain: "gamehub-multijugador.firebaseapp.com",
  databaseURL: "https://gamehub-multijugador-default-rtdb.firebaseio.com",
  projectId: "gamehub-multijugador",
  storageBucket: "gamehub-multijugador.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
