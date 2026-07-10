import { useState } from 'react';
import styles from './InquiryPage.module.css';
import useFetch from '../../../hooks/useFetch';
import { getMyInquiries } from '../../../api/inquiryApi';
import Spinner from '../../../components/Spinner/Spinner';
import ErrorMessage from '../../../components/ErrorMessage/ErrorMessage';
import EmptyState from '../../../components/EmptyState/EmptyState';
import InquiryFormModal from '../../../components/InquiryFormModal/InquiryFormModal';
import InquiryDetailModal from '../../../components/InquiryDetailModal/InquiryDetailModal';
import { INQUIRY_TYPE_LABEL } from '../../../constants/inquiry';

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

function InquiryPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data, loading, error } = useFetch(
    () => getMyInquiries().then(r => r.data ?? r),
    [refreshKey]
  );
  const items = data ?? [];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>문의하기</h1>
        <p className={styles.pageSubtitle}>궁금한 점을 남기고 관리자의 답변을 확인할 수 있어요.</p>
      </div>

      <div className={styles.actionBar}>
        <button className={styles.btnAsk} onClick={() => setModalOpen(true)}>
          + 문의하기
        </button>
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
                <th>제목</th>
                <th>등록일</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
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
      </section>

      {modalOpen && (
        <InquiryFormModal
          onClose={() => setModalOpen(false)}
          onSuccess={() => setRefreshKey(k => k + 1)}
        />
      )}

      {detailId != null && (
        <InquiryDetailModal
          inquiryId={detailId}
          onClose={() => setDetailId(null)}
          onChanged={() => setRefreshKey(k => k + 1)}
        />
      )}
    </div>
  );
}

export default InquiryPage;
