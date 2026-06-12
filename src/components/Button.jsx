import React from 'react';
import styles from './Button.module.css';

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  
  // Custom class logic for score variant to color +/-
  let dynamicClass = '';
  if (variant === 'score') {
    if (children === '-5') dynamicClass = styles.scoreMinus;
    else dynamicClass = styles.scorePlus;
  }

  return (
    <button 
      className={`${styles.btn} ${styles[variant]} ${dynamicClass} ${className}`} 
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
