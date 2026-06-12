import React from 'react';
import styles from './PairSelection.module.css';

export const PAIRS = {
  'ognjen-radmila': { id: 'ognjen-radmila', player1: 'Ognjen', player2: 'Radmila' },
  'boris-ognjen': { id: 'boris-ognjen', player1: 'Boris', player2: 'Ognjen' }
};

const PairSelection = ({ data, onSelectPair }) => {
  return (
    <div className="page-container" style={{ justifyContent: 'center' }}>
      <h1 className={styles.mainTitle}>Domine</h1>
      <h2 className={styles.subtitle}>Izaberi par za igru</h2>
      
      <div className={styles.pairList}>
        {Object.values(PAIRS).map(pair => {
          // Calculate scores
          const pairGames = data.pastGames.filter(g => g.pairId === pair.id);
          const p1Wins = pairGames.filter(g => g.winner === pair.player1).length;
          const p2Wins = pairGames.filter(g => g.winner === pair.player2).length;

          return (
            <button 
              key={pair.id} 
              className={`${styles.pairCard} glass-panel`}
              onClick={() => onSelectPair(pair)}
            >
              <div className={styles.names}>
                <span>{pair.player1}</span>
                <span className={styles.vs}>VS</span>
                <span>{pair.player2}</span>
              </div>
              <div className={styles.scoreContainer}>
                <span className={styles.scoreNumber}>{p1Wins}</span>
                <span className={styles.scoreDivider}>:</span>
                <span className={styles.scoreNumber}>{p2Wins}</span>
              </div>
              <div className={styles.cta}>Enter game &rarr;</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PairSelection;
