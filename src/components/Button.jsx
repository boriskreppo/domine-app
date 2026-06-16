import styles from './Button.module.css';

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  
  // Custom class logic for score variant to color +/-
  let dynamicClass = '';
  if (variant === 'score') {
    if (children === '-5') dynamicClass = styles.scoreMinus;
    else dynamicClass = styles.scorePlus;
  }

  const handleClick = (e) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(30);
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
