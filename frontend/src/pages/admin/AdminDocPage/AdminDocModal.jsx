import { useState, useRef } from 'react';
import styles from './AdminDocModal.module.css';
import { createDocument } from '../../../api/docApi';

const CATEGORIES = ['공통', '개발', '인프라', '보안', '네트워크'];
const VISIBILITIES = ['공개', '비공개'];

function AdminDocModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    category: '',
    visibility: '공개',
    content: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('문서 제목을 입력하세요.'); return; }
    if (!form.category) { setError('카테고리를 선택하세요.'); return; }
    if (!form.content.trim()) { setError('문서 내용을 입력하세요.'); return; }

    setSubmitting(true);
    setError('');
    try {
      await createDocument({
        categoryName: form.category,
        title: form.title.trim(),
        content: form.content.trim(),
        isPublic: form.visibility === '공개',
      });
      onCreated?.();
      onClose();
    } catch {
      setError('문서 등록에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>문서 등록</h2>
            <p className={styles.modalSubtitle}>신입사원이 참고할 지식 문서를 추가합니다.</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label className={styles.label}>문서 제목</label>
            <input
              type="text"
              className={styles.input}
              placeholder="문서 제목을 입력하세요"
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>카테고리</label>
            <select
              className={styles.select}
              value={form.category}
              onChange={e => handleChange('category', e.target.value)}
            >
              <option value="">카테고리 선택</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>공개 상태</label>
            <select
              className={styles.select}
              value={form.visibility}
              onChange={e => handleChange('visibility', e.target.value)}
            >
              {VISIBILITIES.map(v => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={styles.label}>문서 내용</label>
            <textarea
              className={styles.textarea}
              placeholder="문서 내용을 입력하세요"
              value={form.content}
              onChange={e => handleChange('content', e.target.value)}
              rows={8}
            />
          </div>
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={submitting}>
            취소
          </button>
          <button className={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
            {submitting ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDocModal;
