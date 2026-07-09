import { useState } from 'react';
import styles from './AdminQnaFaqModal.module.css';
import { convertQnaToFaq } from '../../../api/qnaApi';

// QNA/DOC 공통 카테고리 → DOC categories 테이블 id (시드 순서 고정: 공통1/개발2/인프라3/보안4/네트워크5)
const CATEGORY_ID = { 공통: 1, 개발: 2, 인프라: 3, 보안: 4, 네트워크: 5 };
const CATEGORIES = Object.keys(CATEGORY_ID);

function AdminQnaFaqModal({ questionId, question, answer, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: question?.title ?? '',
    dept: question?.category ?? '',
    content: answer || question?.content || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    const faqCategoryId = CATEGORY_ID[form.dept];
    if (!form.title.trim() || !faqCategoryId || !form.content.trim()) {
      setError('제목·카테고리·내용을 모두 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await convertQnaToFaq(questionId, {
        faqCategoryId,
        question: form.title.trim(),
        answer: form.content.trim(),
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'FAQ 전환에 실패했습니다.');
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>FAQ 전환</h2>
            <p className={styles.modalSubtitle}>이 질문·답변을 공용 FAQ로 등록합니다.</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label className={styles.label}>질문 제목</label>
            <input
              type="text"
              className={styles.input}
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>카테고리</label>
            <select
              className={styles.select}
              value={form.dept}
              onChange={e => handleChange('dept', e.target.value)}
            >
              <option value="">카테고리 선택</option>
              {CATEGORIES.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>내용</label>
            <textarea
              className={styles.textarea}
              placeholder="FAQ에 노출될 답변 내용을 입력하세요."
              value={form.content}
              onChange={e => handleChange('content', e.target.value)}
            />
          </div>
        </div>

        {error && <p className={styles.faqError}>{error}</p>}

        <div className={styles.modalActions}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={submitting}>
            취소
          </button>
          <button className={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
            {submitting ? '전환 중...' : '등록하기'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminQnaFaqModal;
