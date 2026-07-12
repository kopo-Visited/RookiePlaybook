import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminDocStalePage.module.css';
import AdminDocModal from './AdminDocModal';
import useFetch from '../../../hooks/useFetch';
import useToastStore from '../../../stores/toastStore';
import {
  getAdminDocuments,
  updateDocument,
  deleteDocument,
  reviewDocument,
} from '../../../api/docApi';
import Badge from '../../../components/Badge/Badge';
import { COLOR_KEYS, BADGE_SIZES } from '../../../constants/styles';
import { ROUTES } from '../../../constants/routes';

const STALE_THRESHOLD_DAYS = 90;

const STATUS_COLOR = {
  공개: COLOR_KEYS.BLUE2,
  비공개: COLOR_KEYS.AMBER,
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function AdminDocStalePage() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [editDoc, setEditDoc] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: apiRes, loading } = useFetch(() => getAdminDocuments(), [refreshKey]);
  const docs = useMemo(() => apiRes?.data ?? [], [apiRes]);

  const staleDocs = useMemo(() => {
    const now = Date.now();
    const lastActivity = d => new Date(d.lastReviewedAt ?? d.updatedAt ?? d.createdAt).getTime();
    return docs
      .filter(d => (now - lastActivity(d)) / (1000 * 60 * 60 * 24) >= STALE_THRESHOLD_DAYS)
      .sort((a, b) => lastActivity(a) - lastActivity(b))
      .map(d => ({
        ...d,
        daysAgo: Math.floor((now - lastActivity(d)) / (1000 * 60 * 60 * 24)),
      }));
  }, [docs]);

  const handleEdit = useCallback(doc => {
    setEditDoc(doc);
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback(async doc => {
    if (!window.confirm(`"${doc.title}" 문서를 삭제하시겠습니까?`)) return;
    try {
      await deleteDocument(doc.id);
      setRefreshKey(k => k + 1);
    } catch {
      useToastStore.getState().show('문서 삭제에 실패했습니다.');
    }
  }, []);

  const handleTogglePublic = useCallback(async doc => {
    try {
      await updateDocument(doc.id, {
        categoryName: doc.categoryName,
        title: doc.title,
        content: doc.content,
        isPublic: !doc.isPublic,
      });
      setRefreshKey(k => k + 1);
    } catch {
      useToastStore.getState().show('공개 상태 변경에 실패했습니다.');
    }
  }, []);

  const handleReview = useCallback(async doc => {
    try {
      await reviewDocument(doc.id);
      setRefreshKey(k => k + 1);
    } catch {
      useToastStore.getState().show('검토 완료 처리에 실패했습니다.');
    }
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.titleBlock}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate(ROUTES.ADMIN.DOC)}
          >
            ← 콘텐츠 관리
          </button>
          <h1 className={styles.pageTitle}>미갱신 문서 전체 목록</h1>
          <p className={styles.pageSubtitle}>
            {STALE_THRESHOLD_DAYS}일 이상 업데이트되지 않은 문서입니다. 우선순위가 높은 순으로
            정렬됩니다.
          </p>
        </div>
        {!loading && <span className={styles.countBadge}>{staleDocs.length}건</span>}
      </header>

      <div className={styles.tableCard}>
        {loading && <p className={styles.emptyText}>불러오는 중...</p>}
        {!loading && staleDocs.length === 0 && (
          <p className={styles.emptyText}>{STALE_THRESHOLD_DAYS}일 이상 미갱신 문서가 없습니다.</p>
        )}
        {!loading && staleDocs.length > 0 && (
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>제목</th>
                  <th>카테고리</th>
                  <th>마지막 확인일</th>
                  <th>경과일</th>
                  <th>공개상태</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {staleDocs.map(doc => (
                  <tr key={doc.id}>
                    <td>
                      <div className={styles.titleCell}>
                        <span className={styles.docTitle}>{doc.title}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.textCell}>{doc.categoryName}</div>
                    </td>
                    <td>
                      <div className={styles.textCell}>
                        {formatDate(doc.lastReviewedAt ?? doc.updatedAt ?? doc.createdAt)}
                      </div>
                    </td>
                    <td>
                      <div className={styles.textCell}>
                        <span className={styles.daysBadge}>{doc.daysAgo}일 전</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.textCell}>
                        <Badge
                          colorKey={STATUS_COLOR[doc.isPublic ? '공개' : '비공개']}
                          size={BADGE_SIZES.SM}
                        >
                          {doc.isPublic ? '공개' : '비공개'}
                        </Badge>
                      </div>
                    </td>
                    <td>
                      <div className={styles.actionRow}>
                        <button
                          type="button"
                          className={styles.actionBtnReview}
                          onClick={() => handleReview(doc)}
                        >
                          검토 완료
                        </button>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => handleEdit(doc)}
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                          onClick={() => handleDelete(doc)}
                        >
                          삭제
                        </button>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => handleTogglePublic(doc)}
                        >
                          {doc.isPublic ? '비공개' : '공개'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <AdminDocModal
          onClose={() => {
            setModalOpen(false);
            setEditDoc(null);
          }}
          onCreated={() => {
            setModalOpen(false);
            setEditDoc(null);
            setRefreshKey(k => k + 1);
          }}
          editDoc={editDoc}
        />
      )}
    </div>
  );
}

export default AdminDocStalePage;
