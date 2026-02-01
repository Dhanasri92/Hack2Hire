
import { getApp, getApps, initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAofV3qJnBqasUYh5svFoIsH7DMiQpIicQ",
  authDomain: "testing-app-5.firebaseapp.com",
  projectId: "testing-app-5",
  storageBucket: "testing-app-5.firebasestorage.app",
  messagingSenderId: "526277318495",
  appId: "1:526277318495:web:5e6ae703fe258f267c48ea",
  measurementId: "G-R466V14BK9",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
