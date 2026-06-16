import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD6wJSq16Pf4mcz9HUZswwemkhXOcd5Ha8",
  authDomain: "domine-baza.firebaseapp.com",
  projectId: "domine-baza",
  storageBucket: "domine-baza.firebasestorage.app",
  messagingSenderId: "157121073199",
  appId: "1:157121073199:web:ff1b5daae0be78f9c576da",
  measurementId: "G-GXHC02J9DP"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
