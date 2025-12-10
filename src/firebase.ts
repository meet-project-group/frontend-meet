// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAEkx8nAQX9A9AiMvQ5DGRyihVkSOvtpdc",
  authDomain: "eisc-meet-87ac0.firebaseapp.com",
  projectId: "eisc-meet-87ac0",
  storageBucket: "eisc-meet-87ac0.appspot.com",
  messagingSenderId: "477359963459",
  appId: "1:477359963459:web:93aa6b90125cac3cf2c3f6"
};

// Inicializar app
export const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);

// Firestore (ESTO FALTABA)
export const db = getFirestore(app);
