import { useState, useEffect } from 'react';
import styles from './NoticeFormModal.module.css';
import { createNotice, updateNotice } from '../../api/noticeApi';
import { hasBlank } from '../../utils/validation';

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

function NoticeFormModal({ notice, onClose, onSuccess }) {
  const isEdit = Boolean(notice);
  const [title, setTitle] = useState(notice?.title ?? '');
  const [content, setContent] = useState(notice?.content ?? '');
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
    if (hasBlank(title, content) || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = { title: title.trim(), content: content.trim() };
      if (isEdit) {
        await updateNotice(notice.noticeId, payload);
      } else {
        await createNotice(payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || '공지사항 저장에 실패했습니다.');
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalTop}>
          <div className={styles.modalTitleWrap}>
            <h2 className={styles.title}>{isEdit ? '공지사항 수정' : '공지사항 등록'}</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>제목</label>
            <input
              className={styles.input}
              placeholder="공지 제목을 입력하세요 (최대 200자)"
              value={title}
              maxLength={200}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>내용</label>
            <textarea
              className={styles.textarea}
              placeholder="공지 내용을 입력하세요"
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
            disabled={hasBlank(title, content) || submitting}
          >
            {submitting ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NoticeFormModal;
