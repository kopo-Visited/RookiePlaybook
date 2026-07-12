import { useState, useEffect } from 'react';
import styles from './QnaDetailModal.module.css';
import { getQna, getPublicQna, deleteQna } from '../../api/qnaApi';
import { DEPT_COLOR, COLOR_KEYS, BADGE_SIZES } from '../../constants/styles';
import Badge from '../Badge/Badge';
import useAuthStore from '../../stores/authStore';
import { displayWriter } from '../../utils/maskName';

const STATUS_LABEL = {
  RECEIVED: '접수',
  IN_PROGRESS: '처리중',
  ANSWERED: '답변완료',
  ON_HOLD: '보류',
};

const STATUS_STYLE = {
  RECEIVED: { color: '#FF4D94', background: '#FFF0F6' },
  IN_PROGRESS: { color: '#2288FF', background: '#EAF4FF' },
  ANSWERED: { color: '#12B886', background: '#E6F8F2' },
  ON_HOLD: { color: '#FFAD33', background: '#FFF5E6' },
};

function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

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

function QnaDetailModal({ questionId, onClose, onChanged, onEdit, publicView = false }) {
  const myId = useAuthStore(s => s.user?.userId);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    (publicView ? getPublicQna(questionId) : getQna(questionId))
      .then(res => setDetail(res?.data ?? null))
      .catch(() => setError('질문을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
    return () => {
      document.body.style.overflow = '';
    };
  }, [questionId, publicView]);

  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const editable = !publicView && detail?.status === 'RECEIVED';
  const s = detail ? (STATUS_STYLE[detail.status] ?? {}) : {};

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    setError('');
    try {
      await deleteQna(questionId);
      onChanged?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || '삭제에 실패했습니다.');
      setDeleting(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.top}>
          <h2 className={styles.title}>질문 상세</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <IconX />
          </button>
        </div>

        {loading && <p className={styles.muted}>불러오는 중…</p>}

        {!loading && detail && (
          <>
            <div className={styles.qHead}>
              <span
                className={styles.statusBadge}
                style={{ color: s.color, background: s.background }}
              >
                {STATUS_LABEL[detail.status]}
              </span>
              <Badge
                colorKey={DEPT_COLOR[detail.categoryName] ?? COLOR_KEYS.PURPLE}
                size={BADGE_SIZES.SM}
              >
                {detail.categoryName}
              </Badge>
            </div>
            <h3 className={styles.qTitle}>{detail.title}</h3>
            <p className={styles.qContent}>{detail.content}</p>
            <span className={styles.meta}>
              {publicView && detail.writerName
                ? `${displayWriter(detail.writerName, detail.writerId, myId)} · `
                : ''}
              등록 {formatDateTime(detail.createdAt)}
            </span>

            <div className={styles.answerBlock}>
              <span className={styles.answerLabel}>답변</span>
              {detail.answer ? (
                <div className={styles.answerCard}>
                  <p className={styles.answerContent}>{detail.answer.content}</p>
                  <span className={styles.meta}>{formatDateTime(detail.answer.createdAt)}</span>
                </div>
              ) : (
                <p className={styles.muted}>아직 답변이 등록되지 않았어요.</p>
              )}
            </div>
          </>
        )}

        {error && <p className={styles.error}>{error}</p>}

        {!loading && detail && !publicView && (
          <div className={styles.actions}>
            {editable ? (
              confirmDel ? (
                <>
                  <span className={styles.confirmText}>정말 삭제할까요?</span>
                  <button
                    className={styles.btnOutline}
                    onClick={() => setConfirmDel(false)}
                    disabled={deleting}
                  >
                    취소
                  </button>
                  <button className={styles.btnDanger} onClick={handleDelete} disabled={deleting}>
                    {deleting ? '삭제 중…' : '삭제'}
                  </button>
                </>
              ) : (
                <>
                  <button className={styles.btnOutline} onClick={() => setConfirmDel(true)}>
                    삭제
                  </button>
                  <button className={styles.btnPrimary} onClick={() => onEdit?.(detail)}>
                    수정
                  </button>
                </>
              )
            ) : (
              <span className={styles.mutedHint}>접수 상태에서만 수정·삭제할 수 있어요.</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default QnaDetailModal;
