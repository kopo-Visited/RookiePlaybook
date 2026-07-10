import { useState, useEffect } from 'react';
import styles from './InquiryDetailModal.module.css';
import { getMyInquiry, getAdminInquiry, answerInquiry } from '../../api/inquiryApi';
import { INQUIRY_TYPE_LABEL } from '../../constants/inquiry';

const STATUS_LABEL = { RECEIVED: '접수', ANSWERED: '답변완료' };
const STATUS_STYLE = {
  RECEIVED: { color: '#FF4D94', background: '#FFF0F6' },
  ANSWERED: { color: '#12B886', background: '#E6F8F2' },
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

function InquiryDetailModal({ inquiryId, onClose, onChanged, isAdmin = false }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    (isAdmin ? getAdminInquiry(inquiryId) : getMyInquiry(inquiryId))
      .then(res => setDetail(res?.data ?? null))
      .catch(() => setError('문의를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
    return () => {
      document.body.style.overflow = '';
    };
  }, [inquiryId, isAdmin]);

  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const s = detail ? (STATUS_STYLE[detail.status] ?? {}) : {};

  async function handleAnswer() {
    if (!answer.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await answerInquiry(inquiryId, answer.trim());
      setDetail(res?.data ?? null);
      onChanged?.();
    } catch (err) {
      setError(err.response?.data?.message || '답변 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.top}>
          <h2 className={styles.title}>문의 상세</h2>
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
              <span className={styles.typeLabel}>
                {INQUIRY_TYPE_LABEL[detail.type] ?? detail.type}
              </span>
              {isAdmin && <span className={styles.writer}>{detail.writerName}</span>}
            </div>
            <h3 className={styles.qTitle}>{detail.title}</h3>
            <p className={styles.qContent}>{detail.content}</p>
            <span className={styles.meta}>등록 {formatDateTime(detail.createdAt)}</span>

            <div className={styles.answerBlock}>
              <span className={styles.answerLabel}>답변</span>
              {detail.answer ? (
                <div className={styles.answerCard}>
                  <p className={styles.answerContent}>{detail.answer}</p>
                  <span className={styles.meta}>{formatDateTime(detail.answeredAt)}</span>
                </div>
              ) : isAdmin ? (
                <div className={styles.answerForm}>
                  <textarea
                    className={styles.textarea}
                    placeholder="답변 내용을 입력하세요"
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                  />
                  <button
                    className={styles.btnPrimary}
                    onClick={handleAnswer}
                    disabled={!answer.trim() || submitting}
                  >
                    {submitting ? '등록 중...' : '답변 등록'}
                  </button>
                </div>
              ) : (
                <p className={styles.muted}>아직 답변이 등록되지 않았어요.</p>
              )}
            </div>
          </>
        )}

        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

export default InquiryDetailModal;
