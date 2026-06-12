import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import Game from './pages/Game';
import PairSelection from './pages/PairSelection';
import { loadData, saveData } from './utils/storage';

function App() {
  const [data, setData] = useState(loadData());
  const [selectedPair, setSelectedPair] = useState(null);

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveData(data);
  }, [data]);

  const handleStartNewGame = (maxScore = 150) => {
    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}.`;
    
    setData(prev => ({
      ...prev,
      lastScoreGoal: maxScore,
      currentGame: {
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
    // Ends game without a winner
    setData(prev => ({
      ...prev,
      currentGame: null
    }));
  };

  const handleGameWin = (winnerName) => {
    setData(prev => ({
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
    setData(prev => ({
      ...prev,
      currentGame: {
        ...prev.currentGame,
        [fullKey]: prev.currentGame[fullKey] + amount
      }
    }));
  };

  if (!selectedPair) {
    return <PairSelection data={data} onSelectPair={setSelectedPair} />;
  }

  return (
    <>
      {!data.currentGame ? (
        <Home 
          data={data} 
          selectedPair={selectedPair}
          onStartNewGame={handleStartNewGame} 
          onClearData={() => {
            // Brise samo istoriju za odabrani par
            setData(prev => ({
              ...prev,
              pastGames: prev.pastGames.filter(g => g.pairId !== selectedPair.id)
            }));
          }}
          onBack={() => setSelectedPair(null)}
        />
      ) : (
        <Game 
          gameData={data.currentGame} 
          selectedPair={selectedPair}
          onUpdateScore={handleUpdateScore} 
          onEndGame={handleEndGame}
          onGameWin={handleGameWin}
        />
      )}
    </>
  );
}

export default App;
