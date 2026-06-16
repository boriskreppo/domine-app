import styles from './ConfirmationModal.module.css';
import Button from './Button';

const ConfirmationModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Potvrdi', 
  cancelText = 'Poništi',
  confirmStyle = {} 
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <Button 
            variant="primary" 
            onClick={onConfirm} 
            style={confirmStyle}
          >
            {confirmText}
          </Button>
          <Button variant="text" onClick={onCancel}>
            {cancelText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
