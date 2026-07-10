import { useEffect } from 'react';
import useFetch from '../../hooks/useFetch';
import { getNotices } from '../../api/noticeApi';
import Spinner from '../Spinner/Spinner';
import EmptyState from '../EmptyState/EmptyState';
import styles from './NoticeListModal.module.css';

function IconX() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
      <path
        d="M1 1l12 12M13 1L1 13"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function NoticeListModal({ onClose }) {
  const { data: noticeRes, loading } = useFetch(() => getNotices().catch(() => null), []);
  const notices = Array.isArray(noticeRes?.data) ? noticeRes.data : [];

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalTop}>
          <h2 className={styles.title}>공지사항</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className={styles.body}>
          {loading && <Spinner />}
          {!loading && notices.length === 0 && <EmptyState message="등록된 공지사항이 없습니다." />}
          {!loading && notices.length > 0 && (
            <ul className={styles.list}>
              {notices.map(n => (
                <li key={n.noticeId} className={styles.item}>
                  <div className={styles.itemHead}>
                    <span className={styles.itemTitle}>
                      {n.title}
                      {n.isNew && <span className={styles.newBadge}>N</span>}
                    </span>
                    <span className={styles.itemDate}>{formatDate(n.createdAt)}</span>
                  </div>
                  <p className={styles.itemContent}>{n.content}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default NoticeListModal;
