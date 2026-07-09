import { useState } from 'react';
import styles from './AdminQnaFaqModal.module.css';

const DEPTS = ['개발', '보안', '인프라', '네트워크'];

function AdminQnaFaqModal({ question, answer, onClose }) {
  const [form, setForm] = useState({
    title: question?.title ?? '',
    dept: question?.category ?? '',
    content: answer || question?.content || '',
  });

  const handleChange = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = () => {
    onClose();
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
            <label className={styles.label}>부서</label>
            <select
              className={styles.select}
              value={form.dept}
              onChange={e => handleChange('dept', e.target.value)}
            >
              <option value="">부서 선택</option>
              {DEPTS.map(d => (
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

        <div className={styles.modalActions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            취소
          </button>
          <button className={styles.submitBtn} onClick={handleSubmit}>
            등록하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminQnaFaqModal;
