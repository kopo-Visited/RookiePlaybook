import { useEffect } from 'react';
import styles from './Toast.module.css';

function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={styles.toast}>
      <span className={styles.icon}>🔖</span>
      <span className={styles.message}>{message}</span>
    </div>
  );
}

export default Toast;
