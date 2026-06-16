import { useState } from 'react';
import styles from './PairSelection.module.css';
import Button from '../components/Button';

const PairSelection = ({ data, pairs, onSelectPair, onAddPair }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!p1.trim() || !p2.trim()) return;
    onAddPair(p1, p2);
    setP1('');
    setP2('');
    setIsAdding(false);
  };

  return (
    <div className="page-container" style={{ justifyContent: 'center' }}>
      <h1 className={styles.mainTitle}>Domine</h1>
      <h2 className={styles.subtitle}>Izaberi par za igru</h2>
      
      <div className={styles.pairList}>
        {Object.values(pairs).map(pair => {
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

        <button className={styles.addPairBtn} onClick={() => setIsAdding(true)}>
          + Dodaj novi par
        </button>
      </div>

      {isAdding && (
        <div className={styles.overlay}>
          <form onSubmit={handleSubmit} className={`${styles.addForm} glass-panel`}>
            <h3 className={styles.formTitle}>Novi par za igru</h3>
            <div className={styles.formGroup}>
              <label className={styles.label}>Igrač 1</label>
              <input 
                type="text" 
                value={p1} 
                onChange={e => setP1(e.target.value)} 
                placeholder="Unesi ime"
                required
                className={styles.input}
                autoFocus
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Igrač 2</label>
              <input 
                type="text" 
                value={p2} 
                onChange={e => setP2(e.target.value)} 
                placeholder="Unesi ime"
                required
                className={styles.input}
              />
            </div>
            <div className={styles.formActions}>
              <Button type="submit">Potvrdi</Button>
              <Button type="button" variant="text" onClick={() => setIsAdding(false)}>Otkaži</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PairSelection;
