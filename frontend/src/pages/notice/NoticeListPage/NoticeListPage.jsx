import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NoticeListPage.module.css';
import { getAllNotices } from '../../../api/noticeApi';
import { ROUTES } from '../../../constants/routes';
import Spinner from '../../../components/Spinner/Spinner';
import ErrorMessage from '../../../components/ErrorMessage/ErrorMessage';
import EmptyState from '../../../components/EmptyState/EmptyState';
import useFetch from '../../../hooks/useFetch';

const PAGE_SIZE = 10;

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function NoticeListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data: noticeRes, loading, error } = useFetch(() => getAllNotices(), []);
  const notices = Array.isArray(noticeRes?.data) ? noticeRes.data : [];

  const totalPages = Math.max(1, Math.ceil(notices.length / PAGE_SIZE));
  const pagedNotices = notices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>공지사항</h1>
        <p className={styles.pageSubtitle}>회사의 모든 공지사항을 확인할 수 있어요.</p>
      </div>

      <div className={styles.actionBar}>
        <button className={styles.backBtn} onClick={() => navigate(ROUTES.DASHBOARD)}>
          ← 대시보드로
        </button>
      </div>

      <section className={styles.card}>
        {loading && <Spinner />}
        {!loading && error && <ErrorMessage message="공지사항을 불러오지 못했습니다." />}
        {!loading && !error && notices.length === 0 && (
          <EmptyState message="등록된 공지사항이 없습니다." />
        )}
        {!loading && !error && notices.length > 0 && (
          <ul className={styles.list}>
            {pagedNotices.map(n => (
              <li key={n.noticeId} className={styles.item}>
                <div className={styles.itemHead}>
                  <span className={styles.itemTitle}>
                    {n.title}
                    {n.isNew && <span className={styles.newBadge}>N</span>}
                  </span>
                  <span className={styles.itemDate}>{formatDate(n.createdAt)}</span>
                </div>
                <p className={styles.itemContent}>{n.content}</p>
                <span className={styles.itemWriter}>{n.writerName}</span>
              </li>
            ))}
          </ul>
        )}

        {!loading && !error && totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageArrow}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                className={`${styles.pageNum} ${page === n ? styles.pageNumActive : ''}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              className={styles.pageArrow}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              ›
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default NoticeListPage;
