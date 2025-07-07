import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD93hqjQMiyE6DlTcyZQAfmnDc9u6j0L7g",
  authDomain: "todo-auth-d8fb0.firebaseapp.com",
  projectId: "todo-auth-d8fb0",
  storageBucket: "todo-auth-d8fb0.firebasestorage.app",
  messagingSenderId: "710975163298",
  appId: "1:710975163298:web:fd4a111e115fb476d740fb",
  measurementId: "G-32G7TEB9Y0",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
