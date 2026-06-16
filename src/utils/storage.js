import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

const defaultState = {
  pastGames: [], 
  currentGame: null,
  lastScoreGoal: 150
};

// Referenca na glavni dokument u bazi gde čuvamo stanje celog app-a
const DOC_REF = doc(db, 'domine_data', 'global_state');

export const loadData = () => {
  return defaultState; // Koristi se samo kratko pre prvog učitavanja sa baze
};

// Funkcija koja uspostavlja trajnu WebSocket vezu sa bazom
export const subscribeToData = (callback) => {
  return onSnapshot(DOC_REF, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    } else {
      callback(defaultState);
    }
  }, (error) => {
    console.error("Firebase listen error:", error);
  });
};

export const saveData = async (data) => {
  try {
    await setDoc(DOC_REF, data);
  } catch (e) {
    console.error("Firebase write error:", e);
  }
};
