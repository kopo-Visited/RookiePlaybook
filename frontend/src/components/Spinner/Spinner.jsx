import styles from './Spinner.module.css';

function Spinner({ size = 'md' }) {
  return (
    <div className={styles.wrap}>
      <div className={`${styles.spinner} ${styles[size]}`} />
    </div>
  );
}

export default Spinner;
