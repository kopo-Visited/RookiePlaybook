import { useState } from 'react';
import styles from './AdminInquiryPage.module.css';
import useFetch from '../../../hooks/useFetch';
import { getAdminInquiries } from '../../../api/inquiryApi';
import Spinner from '../../../components/Spinner/Spinner';
import ErrorMessage from '../../../components/ErrorMessage/ErrorMessage';
import EmptyState from '../../../components/EmptyState/EmptyState';
import InquiryDetailModal from '../../../components/InquiryDetailModal/InquiryDetailModal';
import { INQUIRY_TYPE_LABEL } from '../../../constants/inquiry';

const PAGE_SIZE = 10;

const STATUS_LABEL = { RECEIVED: '접수', ANSWERED: '답변완료' };
const STATUS_STYLE = {
  RECEIVED: { color: '#FF4D94', background: '#FFF0F6' },
  ANSWERED: { color: '#12B886', background: '#E6F8F2' },
};

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}`;
}

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || { color: '#172033', background: '#F4F6F9' };
  return (
    <span className={styles.statusBadge} style={{ color: s.color, background: s.background }}>
      {STATUS_LABEL[status] || status}
    </span>
  );
}

function AdminInquiryPage() {
  const [detailId, setDetailId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [page, setPage] = useState(1);

  const { data, loading, error } = useFetch(
    () => getAdminInquiries().then(r => r.data ?? r),
    [refreshKey]
  );
  const items = data ?? [];
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pagedItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>문의 관리</h1>
        <p className={styles.pageSubtitle}>사용자가 남긴 문의를 확인하고 답변하세요.</p>
      </div>

      <section className={styles.tableCard}>
        {loading && <Spinner />}
        {!loading && error && <ErrorMessage />}
        {!loading && !error && items.length === 0 && (
          <EmptyState message="등록된 문의가 없습니다." />
        )}
        {!loading && !error && items.length > 0 && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>상태</th>
                <th>유형</th>
                <th>작성자</th>
                <th>제목</th>
                <th>등록일</th>
              </tr>
            </thead>
            <tbody>
              {pagedItems.map(item => (
                <tr
                  key={item.inquiryId}
                  className={styles.tableRow}
                  onClick={() => setDetailId(item.inquiryId)}
                >
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td>
                    <span className={styles.secondary}>
                      {INQUIRY_TYPE_LABEL[item.type] ?? item.type}
                    </span>
                  </td>
                  <td>
                    <span className={styles.secondary}>{item.writerName}</span>
                  </td>
                  <td>
                    <span className={styles.titleText}>{item.title}</span>
                  </td>
                  <td>
                    <span className={styles.secondary}>{formatDate(item.createdAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                className={`${styles.pageNum} ${n === page ? styles.pageNumActive : ''}`}
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

      {detailId != null && (
        <InquiryDetailModal
          inquiryId={detailId}
          isAdmin
          onClose={() => setDetailId(null)}
          onChanged={() => setRefreshKey(k => k + 1)}
        />
      )}
    </div>
  );
}

export default AdminInquiryPage;
