import React from 'react';
import styles from './ConfirmationModal.module.css';
import Button from './Button';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <Button variant="primary" onClick={onConfirm} style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'}}>Potvrdi Pobedu</Button>
          <Button variant="text" onClick={onCancel}>Poništi poslednji unos</Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
