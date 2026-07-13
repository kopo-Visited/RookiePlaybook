import { useState, useRef, useEffect } from 'react';
import styles from './AdminQnaFaqModal.module.css';
import { convertQnaToFaq } from '../../../api/qnaApi';
import { getAdminFaqs } from '../../../api/docApi';

function IconChevronDown() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AdminQnaFaqModal({ questionId, question, answer, onClose, onSuccess }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: question?.title ?? '',
    categoryId: null,
    content: answer || question?.content || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef(null);

  useEffect(() => {
    getAdminFaqs()
      .then(res => {
        const faqs = Array.isArray(res?.data) ? res.data : [];
        const seen = new Map();
        faqs.forEach(f => {
          if (f.categoryId && !seen.has(f.categoryId)) seen.set(f.categoryId, f.categoryName);
        });
        const opts = Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
        setCategories(opts);
        if (opts.length > 0) {
          const matched = opts.find(o => o.name === question?.category);
          setForm(f => ({ ...f, categoryId: matched?.id ?? opts[0].id }));
        }
      })
      .catch(() => {});
  }, [question?.category]);

  useEffect(() => {
    function onOutside(e) {
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const handleChange = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.categoryId || !form.content.trim()) {
      setError('제목·카테고리·내용을 모두 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await convertQnaToFaq(questionId, {
        faqCategoryId: form.categoryId,
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

          <div className={styles.field} ref={catRef}>
            <label className={styles.label}>카테고리</label>
            <div
              className={`${styles.select} ${catOpen ? styles.selectOpen : ''}`}
              onClick={() => setCatOpen(o => !o)}
            >
              <span className={form.categoryId ? styles.selectValue : styles.selectPlaceholder}>
                {categories.find(c => c.id === form.categoryId)?.name || '카테고리 선택'}
              </span>
              <span className={`${styles.selectArrow} ${catOpen ? styles.selectArrowUp : ''}`}>
                <IconChevronDown />
              </span>
            </div>
            {catOpen && (
              <ul className={styles.dropdown}>
                {categories.map(c => (
                  <li
                    key={c.id}
                    className={`${styles.dropdownItem} ${c.id === form.categoryId ? styles.dropdownItemActive : ''}`}
                    onClick={() => {
                      handleChange('categoryId', c.id);
                      setCatOpen(false);
                    }}
                  >
                    {c.name}
                  </li>
                ))}
              </ul>
            )}
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
