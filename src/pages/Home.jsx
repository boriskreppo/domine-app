import React, { useState } from 'react';
import styles from './Home.module.css';
import Button from '../components/Button';

const Home = ({ data, selectedPair, onStartNewGame, onClearData, onBack }) => {
  const [targetScore, setTargetScore] = useState(data.lastScoreGoal || 150);
  
  // Filtriraj istoriju za izabrani par
  const pairGames = data.pastGames.filter(g => g.pairId === selectedPair.id);

  // Calculate total scores from past games
  const p1Wins = pairGames.filter(g => g.winner === selectedPair.player1).length;
  const p2Wins = pairGames.filter(g => g.winner === selectedPair.player2).length;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '2rem' }}>
        <button 
          onClick={onBack}
          style={{ background: 'transparent', border: 'none', color: 'var(--primary-hover)', fontWeight: 800, cursor: 'pointer', fontSize: '1.2rem' }}
        >
          &larr; Nazad
        </button>
      </div>
      
      <div className={`${styles.scoreBoard} glass-panel`}>
        <div className={styles.scoreTitle}>Total Score</div>
        <div className={styles.scores}>
          <div className={styles.playerScore}>
            <span className={styles.name}>{selectedPair.player1}</span>
            <span className={styles.total}>{p1Wins}</span>
          </div>
          <div className={styles.vs}>VS</div>
          <div className={styles.playerScore}>
            <span className={styles.name}>{selectedPair.player2}</span>
            <span className={styles.total}>{p2Wins}</span>
          </div>
        </div>
      </div>

      <div className={styles.pastGamesSection}>
        <div className={styles.pastGamesTitle}>Past games</div>
        <div className={styles.gamesList}>
          {pairGames.length === 0 ? (
            <div className={styles.noGames}>Nema odigranih partija.</div>
          ) : (
            pairGames.map(game => (
              <div key={game.id} className={`${styles.gameRow} glass-panel`}>
                <div className={styles.gameInfo}>
                  <span className={styles.date}>{game.date}</span>
                  <span>{game.winner}</span>
                </div>
                <span className={styles.winBadge}>Winner</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.settingsArea}>
        <div className={styles.settingsLabel}>Score Goal:</div>
        <div className={styles.settingsControls}>
          <button className={styles.setBtn} onClick={() => setTargetScore(t => Math.max(50, t - 10))}>-</button>
          <span className={styles.targetScoreVal}>{targetScore}</span>
          <button className={styles.setBtn} onClick={() => setTargetScore(t => Math.min(1000, t + 10))}>+</button>
        </div>
      </div>

      <div className={styles.actionArea}>
        <Button onClick={() => onStartNewGame(targetScore)}>Start new game</Button>
      </div>
    </div>
  );
};

export default Home;
