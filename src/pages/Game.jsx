import { useState, useEffect } from 'react';
import styles from './Game.module.css';
import Button from '../components/Button';
import ConfirmationModal from '../components/ConfirmationModal';

const Game = ({ gameData, selectedPair, isHost, onUpdateScore, onEndGame, onGameWin }) => {
  const [pendingWinner, setPendingWinner] = useState(null);
  const [lastAction, setLastAction] = useState(null); 
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!gameData.startTime) return;
    
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [gameData.startTime]);

  const elapsed = gameData.startTime ? Math.floor((now - gameData.startTime) / 1000) : 0;

  // Wake Lock API to prevent screen sleep during gameplay
  useEffect(() => {
    let wakeLock = null;
    
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
          console.log('Wake Lock acquired successfully.');
        }
      } catch (err) {
        console.warn('Wake Lock request failed:', err.message);
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock !== null) {
        wakeLock.release()
          .then(() => {
            wakeLock = null;
            console.log('Wake Lock released.');
          })
          .catch((err) => {
            console.error('Error releasing Wake Lock:', err.message);
          });
      }
    };
  }, []);

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
          {gameData.startTime && (
            <span className={styles.infoBlock}>
              <span className={styles.infoLabel}>Timer</span>
              <span className={styles.timer}>{formatTime(elapsed)}</span>
            </span>
          )}
          <span className={styles.infoBlock}>
            <span className={styles.infoLabel}>Goal</span>
            <span className={styles.date}>{gameData.maxScore || 150}</span>
          </span>
        </div>
      </div>

      {/* Player 1 */}
      <div className={`${styles.playerSection} glass-panel`}>
        <div className={styles.playerHeader}>
          <div className={styles.playerName}>{selectedPair.player1}</div>
          <div key={gameData.player1Score} className={styles.scoreDisplay}>{gameData.player1Score}</div>
        </div>
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
        <div className={styles.playerHeader}>
          <div className={styles.playerName}>{selectedPair.player2}</div>
          <div key={gameData.player2Score} className={styles.scoreDisplay}>{gameData.player2Score}</div>
        </div>
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
        message={`Da li ste sigurni da je ${pendingWinner?.name} pobedio? (Ima >= ${gameData.maxScore || 150} poena)`}
        onConfirm={handleConfirmWin}
        onCancel={handleCancelWin}
        confirmText="Potvrdi Pobedu"
        cancelText="Poništi poslednji unos"
        confirmStyle={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
          borderRadius: 0
        }}
      />
    </div>
  );
};

export default Game;
