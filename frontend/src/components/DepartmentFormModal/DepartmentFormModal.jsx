import { useState, useEffect } from 'react';
import styles from './DepartmentFormModal.module.css';
import { createDepartment, renameDepartment } from '../../api/adminUserApi';

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

function DepartmentFormModal({ department, onClose, onSuccess }) {
  const isEdit = Boolean(department);
  const [code, setCode] = useState(department?.code ?? '');
  const [name, setName] = useState(department?.name ?? '');
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
    if (!name.trim() || (!isEdit && !code.trim()) || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      if (isEdit) {
        await renameDepartment(department.departmentId, name.trim());
      } else {
        await createDepartment({ code: code.trim(), name: name.trim() });
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || '저장에 실패했습니다.');
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalTop}>
          <div className={styles.modalTitleWrap}>
            <h2 className={styles.title}>{isEdit ? '부서 이름 변경' : '부서 추가'}</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className={styles.formGrid}>
          {!isEdit && (
            <div className={styles.field}>
              <label className={styles.fieldLabel}>부서 코드</label>
              <input
                className={styles.input}
                placeholder="예: QA"
                value={code}
                onChange={e => setCode(e.target.value)}
              />
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.fieldLabel}>부서명</label>
            <input
              className={styles.input}
              placeholder="예: 품질보증팀"
              value={name}
              onChange={e => setName(e.target.value)}
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
            disabled={!name.trim() || (!isEdit && !code.trim()) || submitting}
          >
            {submitting ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DepartmentFormModal;
