import { useEffect } from 'react';
import useFetch from '../../hooks/useFetch';
import { getMyProgress } from '../../api/eduApi';
import { formatDate } from '../../utils/formatDate';
import Spinner from '../Spinner/Spinner';
import EmptyState from '../EmptyState/EmptyState';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import styles from './MyProgressModal.module.css';

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

// 진도 상태 → 상태 칩 (EducationListPage와 동일, 기존 색 토큰만 사용)
function statusChip(edu) {
  if (edu.isCompleted)
    return { label: '완료', bg: 'var(--color-green-bg)', color: 'var(--color-green)' };
  if (edu.progressRate > 0) return { label: '진행중', bg: '#DFF1FF', color: '#2288FF' };
  return { label: '미시작', bg: '#EEF1F6', color: 'var(--color-text-secondary)' };
}

function MyProgressModal({ onClose }) {
  const { data: apiRes, loading, error } = useFetch(() => getMyProgress(), []);

  // 응답 data는 배열 (진도 기록이 있는 과정만, 없으면 빈 배열)
  const list = Array.isArray(apiRes?.data) ? apiRes.data : [];

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
          <h2 className={styles.title}>내 학습 현황</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            <IconX />
          </button>
        </div>

        <div className={styles.body}>
          {loading && <Spinner />}
          {!loading && error && <ErrorMessage message="학습 현황을 불러오지 못했습니다." />}
          {!loading && !error && list.length === 0 && (
            <EmptyState message="수강한 교육이 없습니다." />
          )}
          {!loading && !error && list.length > 0 && (
            <ul className={styles.list}>
              {list.map(edu => {
                const chip = statusChip(edu);
                return (
                  <li key={edu.educationId} className={styles.item}>
                    <div className={styles.itemHead}>
                      <span className={styles.itemTitle}>{edu.title}</span>
                      <span
                        className={styles.badge}
                        style={{ background: chip.bg, color: chip.color }}
                      >
                        {chip.label}
                      </span>
                      {edu.isCompleted && edu.completedAt && (
                        <span className={styles.completedAt}>
                          수료일 {formatDate(edu.completedAt)}
                        </span>
                      )}
                    </div>
                    <div className={styles.progressRow}>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${edu.progressRate ?? 0}%` }}
                        />
                      </div>
                      <span className={styles.progressPct}>{edu.progressRate ?? 0}%</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyProgressModal;
