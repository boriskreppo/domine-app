import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Game from './pages/Game';
import PairSelection from './pages/PairSelection';
import { PAIRS } from './utils/pairs';
import { loadData, saveData, subscribeToData, addPastGame, clearPastGames } from './utils/storage';

const getDeviceId = () => {
  let id = localStorage.getItem('domine_device_id');
  if (!id) {
    id = 'device_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('domine_device_id', id);
  }
  return id;
};
const DEVICE_ID = getDeviceId();

function App() {
  const [data, setData] = useState(loadData());
  const [selectedPair, setSelectedPair] = useState(null);

  // Sinhronizacija u pozadini (Firebase WebSockets)
  useEffect(() => {
    // Kada se baza na internetu promeni, Firebase automatski zove ovu funkciju u mili-sekundi
    const unsubscribe = subscribeToData((serverData) => {
      setData(serverData);
    });
    
    // Kada se komponenta ugasi, prekidamo osluškivanje
    return () => unsubscribe();
  }, []);

  // Centralizovana funkcija za promenu stanja i istovremeno snimanje na API
  const updateAndSaveData = (updater) => {
    setData(prev => {
      const newData = typeof updater === 'function' ? updater(prev) : updater;
      saveData(newData);
      return newData;
    });
  };

  const handleStartNewGame = (maxScore = 150) => {
    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}.`;
    
    updateAndSaveData(prev => ({
      ...prev,
      lastScoreGoal: maxScore,
      currentGame: {
        pairId: selectedPair.id,
        hostId: DEVICE_ID,
        player1Score: 0,
        player2Score: 0,
        date: dateStr,
        startTime: Date.now(),
        isActive: true,
        maxScore: maxScore
      }
    }));
  };

  const handleEndGame = () => {
    updateAndSaveData(prev => ({
      ...prev,
      currentGame: null
    }));
  };

  const handleGameWin = async (winnerName) => {
    const newGame = {
      date: data.currentGame.date,
      winner: winnerName,
      pairId: selectedPair.id
    };
    
    await addPastGame(newGame);
    
    updateAndSaveData(prev => ({
      ...prev,
      currentGame: null
    }));
  };

  const handleUpdateScore = (playerKey, amount) => {
    const fullKey = `${playerKey}Score`;
    updateAndSaveData(prev => ({
      ...prev,
      currentGame: {
        ...prev.currentGame,
        [fullKey]: prev.currentGame[fullKey] + amount
      }
    }));
  };

  // Kombinujemo predefinisane parove i one iz baze podataka
  const getPairsList = () => {
    const customPairs = data.pairs || [];
    const allPairs = { ...PAIRS };
    customPairs.forEach(p => {
      allPairs[p.id] = p;
    });
    return allPairs;
  };
  const pairsList = getPairsList();

  const handleAddPair = (player1, player2) => {
    const p1 = player1.trim();
    const p2 = player2.trim();
    if (!p1 || !p2) return;
    
    const formattedP1 = p1.charAt(0).toUpperCase() + p1.slice(1);
    const formattedP2 = p2.charAt(0).toUpperCase() + p2.slice(1);
    
    const pairId = `${formattedP1.toLowerCase().replace(/\s+/g, '')}-${formattedP2.toLowerCase().replace(/\s+/g, '')}`;
    const newPair = { id: pairId, player1: formattedP1, player2: formattedP2 };
    
    updateAndSaveData(prev => {
      const existingPairs = prev.pairs || [];
      if (existingPairs.some(p => p.id === pairId)) {
        return prev;
      }
      return {
        ...prev,
        pairs: [...existingPairs, newPair]
      };
    });
  };

  // AKO POSTOJI AKTIVNA IGRA:
  // Preskačemo sve i automatski sve uređaje ubacujemo u tu igru!
  if (data.currentGame && data.currentGame.pairId) {
    const playingPair = pairsList[data.currentGame.pairId] || selectedPair;
    return (
      <Game 
        gameData={data.currentGame} 
        selectedPair={playingPair}
        isHost={data.currentGame.hostId === DEVICE_ID}
        onUpdateScore={handleUpdateScore} 
        onEndGame={handleEndGame}
        onGameWin={handleGameWin}
      />
    );
  }

  // AKO NEMA AKTIVNE IGRE:
  if (!selectedPair) {
    return (
      <PairSelection 
        data={data} 
        pairs={pairsList}
        onSelectPair={setSelectedPair} 
        onAddPair={handleAddPair}
      />
    );
  }

  return (
    <Home 
      data={data} 
      selectedPair={selectedPair}
      onStartNewGame={handleStartNewGame} 
      onClearData={async () => {
        await clearPastGames(selectedPair.id);
      }}
      onBack={() => setSelectedPair(null)}
    />
  );
}

export default App;
