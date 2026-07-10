import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';
import Button from '../../../components/Button/Button';
import { ROUTES } from '../../../constants/routes';

function NotFoundPage() {
  return (
    <div className={styles.page}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>페이지를 찾을 수 없습니다.</h1>
      <p className={styles.desc}>주소가 잘못되었거나 삭제된 페이지일 수 있습니다.</p>
      <Link to={ROUTES.DASHBOARD}>
        <Button>대시보드로 이동</Button>
      </Link>
    </div>
  );
}

export default NotFoundPage;
