import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import Game from './pages/Game';
import PairSelection, { PAIRS } from './pages/PairSelection';
import { loadData, saveData, subscribeToData } from './utils/storage';

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

  const handleGameWin = (winnerName) => {
    updateAndSaveData(prev => ({
      ...prev,
      pastGames: [
        {
          id: Date.now().toString(),
          date: prev.currentGame.date,
          winner: winnerName,
          pairId: selectedPair.id
        },
        ...prev.pastGames
      ],
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

  // AKO POSTOJI AKTIVNA IGRA:
  // Preskačemo sve i automatski sve uređaje ubacujemo u tu igru!
  if (data.currentGame && data.currentGame.pairId) {
    const playingPair = PAIRS[data.currentGame.pairId] || selectedPair;
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
    return <PairSelection data={data} onSelectPair={setSelectedPair} />;
  }

  return (
    <Home 
      data={data} 
      selectedPair={selectedPair}
      onStartNewGame={handleStartNewGame} 
      onClearData={() => {
        // Brise samo istoriju za odabrani par i odmah salje na API
        updateAndSaveData(prev => ({
          ...prev,
          pastGames: prev.pastGames.filter(g => g.pairId !== selectedPair.id)
        }));
      }}
      onBack={() => setSelectedPair(null)}
    />
  );
}

export default App;
