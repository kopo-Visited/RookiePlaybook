import styles from './EmptyState.module.css';
import { EMPTY_MESSAGES } from '../../constants/message';

function EmptyState({ message = EMPTY_MESSAGES.DEFAULT }) {
  return (
    <div className={styles.wrap}>
      <p className={styles.message}>{message}</p>
    </div>
  );
}

export default EmptyState;
