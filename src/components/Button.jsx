import styles from './Button.module.css';

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  
  // Custom class logic for score variant to color +/-
  let dynamicClass = '';
  if (variant === 'score') {
    if (String(children).startsWith('-')) {
      dynamicClass = styles.scoreMinus;
    } else {
      dynamicClass = styles.scorePlus;
    }
  }

  const handleClick = (e) => {
    if (typeof navigator !== 'undefined') {
      if (navigator.vibrate) {
        navigator.vibrate(30);
      } else {
        // iOS 18+ Haptic switch hack
        try {
          const check = document.createElement('input');
          check.type = 'checkbox';
          check.setAttribute('switch', '');
          check.style.position = 'absolute';
          check.style.opacity = '0';
          check.style.pointerEvents = 'none';
          document.body.appendChild(check);
          check.click();
          setTimeout(() => check.remove(), 50);
        } catch {
          // Ignoriši ako pretraživač ne dozvoljava
        }
      }
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button 
      className={`${styles.btn} ${styles[variant]} ${dynamicClass} ${className}`} 
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
