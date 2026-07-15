import styles from './Badge.module.css';
import { COLOR_KEYS, BADGE_SIZES } from '../../constants/styles';

function Badge({ children, colorKey = COLOR_KEYS.BLUE, size = BADGE_SIZES.MD }) {
  return <span className={`${styles.badge} ${styles[colorKey]} ${styles[size]}`}>{children}</span>;
}

export default Badge;
