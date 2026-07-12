import { useState } from 'react';
import styles from './AdminDocModal.module.css';
import { createDocument, updateDocument, createAdminFaq } from '../../../api/docApi';
import Dropdown from '../../../components/Dropdown/Dropdown';

const CATEGORIES = ['공통', '개발', '인프라', '보안', '네트워크'];
const VISIBILITIES = ['공개', '비공개'];
const CATEGORY_ID = { 공통: 1, 개발: 2, 인프라: 3, 보안: 4, 네트워크: 5 };

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

function AdminDocFaqModal({ doc, onClose, onSuccess }) {
  const [form, setForm] = useState({
    category: doc?.categoryName ?? '',
    question: doc?.title ?? '',
    answer: doc?.content ?? '',
    visibility: '공개',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.question.trim()) {
      setError('질문을 입력하세요.');
      return;
    }
    if (!form.category) {
      setError('카테고리를 선택하세요.');
      return;
    }
    if (!form.answer.trim()) {
      setError('답변 내용을 입력하세요.');
      return;
    }
    const categoryId = CATEGORY_ID[form.category];
    if (!categoryId) {
      setError('유효하지 않은 카테고리입니다.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await createAdminFaq({
        categoryId,
        question: form.question.trim(),
        answer: form.answer.trim(),
        isPublic: form.visibility === '공개',
      });
      onSuccess?.();
      onClose();
    } catch {
      setError('FAQ 등록에 실패했습니다.');
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>FAQ에 추가</h2>
            <p className={styles.modalSubtitle}>이 문서를 기반으로 FAQ를 등록합니다.</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            <IconX />
          </button>
        </div>

        <div className={styles.formGrid}>
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={styles.label}>질문</label>
            <input
              type="text"
              className={styles.input}
              placeholder="질문을 입력하세요"
              value={form.question}
              onChange={e => handleChange('question', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>카테고리</label>
            <Dropdown
              value={form.category}
              onChange={val => handleChange('category', val)}
              options={CATEGORIES.map(c => ({ value: c, label: c }))}
              placeholder="카테고리 선택"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>공개 상태</label>
            <Dropdown
              value={form.visibility}
              onChange={val => handleChange('visibility', val)}
              options={VISIBILITIES.map(v => ({ value: v, label: v }))}
            />
          </div>

          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={styles.label}>답변</label>
            <textarea
              className={styles.textarea}
              placeholder="답변 내용을 입력하세요"
              value={form.answer}
              onChange={e => handleChange('answer', e.target.value)}
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

function AdminDocModal({ onClose, onCreated, editDoc }) {
  const isEdit = !!editDoc;

  const [form, setForm] = useState({
    title: editDoc?.title ?? '',
    category: editDoc?.categoryName ?? '',
    visibility: editDoc?.isPublic === false ? '비공개' : '공개',
    content: editDoc?.content ?? '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showFaqModal, setShowFaqModal] = useState(false);

  const handleChange = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError('문서 제목을 입력하세요.');
      return;
    }
    if (!form.category) {
      setError('카테고리를 선택하세요.');
      return;
    }
    if (!form.content.trim()) {
      setError('문서 내용을 입력하세요.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        categoryName: form.category,
        title: form.title.trim(),
        content: form.content.trim(),
        isPublic: form.visibility === '공개',
      };
      if (isEdit) {
        await updateDocument(editDoc.id, payload);
      } else {
        await createDocument(payload);
      }
      onCreated?.();
      onClose();
    } catch {
      setError(isEdit ? '문서 수정에 실패했습니다.' : '문서 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <div>
              <h2 className={styles.modalTitle}>{isEdit ? '문서 수정' : '문서 등록'}</h2>
              <p className={styles.modalSubtitle}>
                {isEdit ? '문서 내용을 수정합니다.' : '신입사원이 참고할 지식 문서를 추가합니다.'}
              </p>
            </div>
            <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
              <IconX />
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
              <Dropdown
                value={form.category}
                onChange={val => handleChange('category', val)}
                options={CATEGORIES.map(c => ({ value: c, label: c }))}
                placeholder="카테고리 선택"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>공개 상태</label>
              <Dropdown
                value={form.visibility}
                onChange={val => handleChange('visibility', val)}
                options={VISIBILITIES.map(v => ({ value: v, label: v }))}
              />
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
            {isEdit && (
              <button
                className={styles.faqBtn}
                onClick={() => setShowFaqModal(true)}
                disabled={submitting}
              >
                FAQ에 추가
              </button>
            )}
            <button className={styles.cancelBtn} onClick={onClose} disabled={submitting}>
              취소
            </button>
            <button className={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
              {submitting
                ? isEdit
                  ? '수정 중...'
                  : '등록 중...'
                : isEdit
                  ? '수정하기'
                  : '등록하기'}
            </button>
          </div>
        </div>
      </div>

      {showFaqModal && (
        <AdminDocFaqModal
          doc={{
            ...editDoc,
            categoryName: form.category,
            title: form.title,
            content: form.content,
          }}
          onClose={() => setShowFaqModal(false)}
          onSuccess={() => setShowFaqModal(false)}
        />
      )}
    </>
  );
}

export default AdminDocModal;
