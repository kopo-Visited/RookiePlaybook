import styles from './ErrorMessage.module.css';
import { ERROR_MESSAGES } from '../../constants/message';

function ErrorMessage({ message = ERROR_MESSAGES.DEFAULT }) {
  return (
    <div className={styles.wrap}>
      <p className={styles.message}>{message}</p>
    </div>
  );
}

export default ErrorMessage;
