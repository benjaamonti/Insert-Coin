import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBiZV7fityZooHwomVjtfMSq5vX31o9OeM",
  authDomain: "insert-coin-github.firebaseapp.com",
  databaseURL: "https://insert-coin-github-default-rtdb.firebaseio.com",
  projectId: "insert-coin-github",
  storageBucket: "insert-coin-github.firebasestorage.app",
  messagingSenderId: "898080637289",
  appId: "1:898080637289:web:32f32b267849fe41c7fdf8"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
