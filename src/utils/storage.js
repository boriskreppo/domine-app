import { doc, setDoc, onSnapshot, collection, query, orderBy, getDocs, writeBatch, where } from "firebase/firestore";
import { db } from "./firebase";

const defaultState = {
  pastGames: [], 
  currentGame: null,
  lastScoreGoal: 150
};

// Reference na glavni dokument i subkolekciju
const DOC_REF = doc(db, 'domine_data', 'global_state');
const PAST_GAMES_REF = collection(db, 'domine_data', 'global_state', 'past_games');

export const loadData = () => {
  return defaultState;
};

// Funkcija koja uspostavlja trajnu WebSocket vezu sa bazom (kombinuje globalni doc i subkolekciju)
export const subscribeToData = (callback) => {
  let docState = { currentGame: null, lastScoreGoal: 150 };
  let pastGamesState = [];

  const emitUpdate = () => {
    callback({
      ...docState,
      pastGames: pastGamesState
    });
  };

  // 1. Osluškivanje globalnog dokumenta
  const unsubDoc = onSnapshot(DOC_REF, async (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      
      // MIGRACIJA: Ako nađemo pastGames u starom formatu, prebacujemo u subkolekciju
      if (Array.isArray(data.pastGames) && data.pastGames.length > 0) {
        console.log(`[MIGRATION] Pronađen stari niz partija (${data.pastGames.length}). Migriram...`);
        try {
          const batch = writeBatch(db);
          data.pastGames.forEach((game) => {
            const gameId = game.id || Date.now().toString() + '_' + Math.random().toString(36).substring(2, 7);
            const docRef = doc(db, 'domine_data', 'global_state', 'past_games', gameId);
            batch.set(docRef, {
              date: game.date || '',
              winner: game.winner || '',
              pairId: game.pairId || '',
              createdAt: game.createdAt || Number(game.id) || Date.now()
            });
          });
          
          // Čistimo niz iz globalnog dokumenta
          batch.update(DOC_REF, {
            pastGames: []
          });
          
          await batch.commit();
          console.log("[MIGRATION] Uspešno migrirano u subkolekciju.");
        } catch (migErr) {
          console.error("[MIGRATION] Greška pri migraciji:", migErr);
        }
      }

      docState = {
        currentGame: data.currentGame || null,
        lastScoreGoal: data.lastScoreGoal || 150,
        pairs: data.pairs || []
      };
    } else {
      docState = { currentGame: null, lastScoreGoal: 150, pairs: [] };
    }
    emitUpdate();
  }, (error) => {
    console.error("Firebase listen error:", error);
  });

  // 2. Osluškivanje subkolekcije partija
  const q = query(PAST_GAMES_REF, orderBy("createdAt", "desc"));
  const unsubPastGames = onSnapshot(q, (snapshot) => {
    pastGamesState = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    emitUpdate();
  }, (error) => {
    console.warn("Firebase ordered listen error (order index may be missing), retrying raw:", error);
    // Fallback na neuređen upit
    onSnapshot(PAST_GAMES_REF, (snapshot) => {
      pastGamesState = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      emitUpdate();
    });
  });

  return () => {
    unsubDoc();
    unsubPastGames();
  };
};

export const saveData = async (data) => {
  try {
    const { currentGame, lastScoreGoal, pairs } = data;
    await setDoc(DOC_REF, {
      currentGame: currentGame || null,
      lastScoreGoal: lastScoreGoal || 150,
      pairs: pairs || []
    });
  } catch (e) {
    console.error("Firebase write error:", e);
  }
};

export const addPastGame = async (game) => {
  try {
    const gameId = Date.now().toString();
    const docRef = doc(db, 'domine_data', 'global_state', 'past_games', gameId);
    await setDoc(docRef, {
      ...game,
      createdAt: Date.now()
    });
  } catch (e) {
    console.error("Error adding past game:", e);
  }
};

export const clearPastGames = async (pairId) => {
  try {
    const q = query(PAST_GAMES_REF, where("pairId", "==", pairId));
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  } catch (e) {
    console.error("Error clearing past games:", e);
  }
};
