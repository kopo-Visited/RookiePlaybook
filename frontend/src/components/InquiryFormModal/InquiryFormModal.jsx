import { useState, useEffect } from 'react';
import styles from './InquiryFormModal.module.css';
import { createInquiry } from '../../api/inquiryApi';
import { INQUIRY_TYPES } from '../../constants/inquiry';

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

function InquiryFormModal({ onClose, onSuccess }) {
  const [type, setType] = useState(INQUIRY_TYPES[0].value);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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

  async function handleSubmit() {
    if (!title.trim() || !content.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      await createInquiry({ type, title: title.trim(), content: content.trim() });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || '문의 등록에 실패했습니다.');
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalTop}>
          <div className={styles.modalTitleWrap}>
            <h2 className={styles.title}>문의하기</h2>
            <p className={styles.subtitle}>
              궁금한 점이나 요청 사항을 남겨주시면 관리자가 확인 후 답변드려요.
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>문의 유형</label>
            <select className={styles.select} value={type} onChange={e => setType(e.target.value)}>
              {INQUIRY_TYPES.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>제목</label>
            <input
              className={styles.input}
              placeholder="문의 제목을 입력하세요"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>내용</label>
            <textarea
              className={styles.textarea}
              placeholder="문의하실 내용을 자세히 적어주세요"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>
        </div>

        {error && <p className={styles.formError}>{error}</p>}

        <div className={styles.modalActions}>
          <button className={styles.btnOutline} onClick={onClose} disabled={submitting}>
            취소
          </button>
          <button
            className={styles.btnPrimary}
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim() || submitting}
          >
            {submitting ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InquiryFormModal;
