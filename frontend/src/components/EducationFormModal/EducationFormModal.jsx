import { useState, useEffect } from 'react';
import styles from './EducationFormModal.module.css';
import { createEducation, updateEducation } from '../../api/eduApi';

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

function EducationFormModal({ education, onClose, onSuccess }) {
  const isEdit = Boolean(education);
  const [title, setTitle] = useState(education?.title ?? '');
  const [description, setDescription] = useState(education?.description ?? '');
  const [completionCriteria, setCompletionCriteria] = useState(
    education?.completionCriteria != null ? String(education.completionCriteria) : ''
  );
  const [contentYear, setContentYear] = useState(
    education?.contentYear != null ? String(education.contentYear) : ''
  );
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

  // 백엔드 검증과 동일: 과정명 필수·100자 이내, 수료 기준 0~100 정수, 콘텐츠 연도 선택·2000 이상
  const criteriaNum = Number(completionCriteria);
  const criteriaValid =
    completionCriteria !== '' &&
    Number.isInteger(criteriaNum) &&
    criteriaNum >= 0 &&
    criteriaNum <= 100;
  const yearNum = Number(contentYear);
  const contentYearValid = contentYear === '' || (Number.isInteger(yearNum) && yearNum >= 2000);
  const canSubmit =
    Boolean(title.trim()) &&
    title.trim().length <= 100 &&
    criteriaValid &&
    contentYearValid &&
    !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        completionCriteria: criteriaNum,
        contentYear: contentYear === '' ? null : yearNum,
      };
      if (isEdit) {
        await updateEducation(education.educationId, payload);
      } else {
        await createEducation(payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || '교육 과정 저장에 실패했습니다.');
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalTop}>
          <div className={styles.modalTitleWrap}>
            <h2 className={styles.title}>{isEdit ? '교육 과정 수정' : '교육 과정 등록'}</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            <IconX />
          </button>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>과정명</label>
            <input
              className={styles.input}
              placeholder="교육 과정명을 입력하세요 (최대 100자)"
              value={title}
              maxLength={100}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>설명 (선택)</label>
            <textarea
              className={styles.textarea}
              placeholder="교육 과정 설명을 입력하세요"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>수료 기준 (%)</label>
            <input
              className={styles.input}
              type="number"
              min="0"
              max="100"
              placeholder="0 ~ 100"
              value={completionCriteria}
              onChange={e => setCompletionCriteria(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>콘텐츠 기준연도 (선택)</label>
            <input
              className={styles.input}
              type="number"
              min="2000"
              placeholder="예: 2024"
              value={contentYear}
              onChange={e => setContentYear(e.target.value)}
            />
            {!contentYearValid && (
              <p className={styles.formError}>콘텐츠 기준연도는 2000 이상이어야 합니다.</p>
            )}
          </div>
        </div>

        {error && <p className={styles.formError}>{error}</p>}

        <div className={styles.modalActions}>
          <button className={styles.btnOutline} onClick={onClose} disabled={submitting}>
            취소
          </button>
          <button className={styles.btnPrimary} onClick={handleSubmit} disabled={!canSubmit}>
            {submitting ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EducationFormModal;
