import React, { useState, useEffect } from 'react';
import styles from './Game.module.css';
import Button from '../components/Button';
import ConfirmationModal from '../components/ConfirmationModal';

const Game = ({ gameData, selectedPair, isHost, onUpdateScore, onEndGame, onGameWin }) => {
  const [pendingWinner, setPendingWinner] = useState(null);
  const [lastAction, setLastAction] = useState(null); 
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!gameData.startTime) return;
    
    // Set initial elapsed time
    setElapsed(Math.floor((Date.now() - gameData.startTime) / 1000));
    
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - gameData.startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [gameData.startTime]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleScore = (player, amount) => {
    // Sprečavamo dalje kliktanje ako je neko pobedio a popup je aktivan
    if (pendingWinner) return;

    const currentScore = gameData[`${player}Score`];
    const newScore = currentScore + amount;
    
    // Sprečavamo negativne poene
    if (newScore < 0) return;
    
    // Čuvamo poslednju akciju za revert
    setLastAction({ player, amount });
    onUpdateScore(player, amount);

    // Provera za pobedu
    const goal = gameData.maxScore || 150;
    if (newScore >= goal) {
      setPendingWinner({
        name: player === 'player1' ? selectedPair.player1 : selectedPair.player2,
        playerKey: player
      });
    }
  };

  const handleConfirmWin = () => {
    onGameWin(pendingWinner.name);
  };

  const handleCancelWin = () => {
    // Poništavamo poslednju akciju
    if (lastAction) {
      onUpdateScore(lastAction.player, -lastAction.amount);
    }
    setPendingWinner(null);
    setLastAction(null);
  };

  return (
    <div className="page-container">
      <div className={styles.header}>
        <div className={styles.title}>Domine</div>
        {isHost && <Button variant="text" className={styles.endBtn} onClick={onEndGame}>End game</Button>}
      </div>

      <div className={`${styles.gameInfo} glass-panel`}>
        <h2>Current game</h2>
        <div className={styles.timeInfo}>
          {gameData.startTime && <span className={styles.timer}>{formatTime(elapsed)}</span>}
          <span className={styles.date}>Goal: {gameData.maxScore || 150}</span>
        </div>
      </div>

      {/* Player 1 */}
      <div className={`${styles.playerSection} glass-panel`}>
        <div className={styles.playerName}>{selectedPair.player1}</div>
        <div className={styles.scoreDisplay}>{gameData.player1Score}</div>
        {isHost && (
          <div className={styles.controls}>
            <Button variant="score" onClick={() => handleScore('player1', 5)}>+5</Button>
            <Button variant="score" onClick={() => handleScore('player1', 10)}>+10</Button>
            <Button variant="score" onClick={() => handleScore('player1', -5)}>-5</Button>
          </div>
        )}
      </div>

      <div className={styles.divider}>VS</div>

      {/* Player 2 */}
      <div className={`${styles.playerSection} glass-panel`}>
        <div className={styles.playerName}>{selectedPair.player2}</div>
        <div className={styles.scoreDisplay}>{gameData.player2Score}</div>
        {isHost && (
          <div className={styles.controls}>
            <Button variant="score" onClick={() => handleScore('player2', 5)}>+5</Button>
            <Button variant="score" onClick={() => handleScore('player2', 10)}>+10</Button>
            <Button variant="score" onClick={() => handleScore('player2', -5)}>-5</Button>
          </div>
        )}
      </div>

      <ConfirmationModal 
        isOpen={!!pendingWinner}
        title="Kraj igre!"
        message={`Da li ste sigurni da je ${pendingWinner?.name} pobedio? (Ima >= 150 poena)`}
        onConfirm={handleConfirmWin}
        onCancel={handleCancelWin}
      />
    </div>
  );
};

export default Game;
