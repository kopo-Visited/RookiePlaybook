import { useState, useEffect, useRef } from 'react';
import styles from './QnaQuestionModal.module.css';
import { createQna, updateQna, getQuestionCategories } from '../../api/qnaApi';

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

function QnaQuestionModal({ onClose, onSuccess, mode = 'create', questionId, initial }) {
  const isEdit = mode === 'edit';
  const [title, setTitle] = useState(initial?.title ?? '');
  const [categoryId, setCategoryId] = useState('');
  const [content, setContent] = useState(initial?.content ?? '');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [categories, setCategories] = useState([]);
  const [catOpen, setCatOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const catRef = useRef(null);

  const selectedCategory = categories.find(c => c.categoryId === categoryId);

  useEffect(() => {
    getQuestionCategories()
      .then(res => {
        const list = res?.data?.categories ?? [];
        setCategories(list);
        // 편집 모드: 카테고리명으로 categoryId 초기 선택
        if (initial?.categoryName) {
          const match = list.find(c => c.name === initial.categoryName);
          if (match) setCategoryId(match.categoryId);
        }
      })
      .catch(() => setCategories([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  useEffect(() => {
    function handleClickOutside(e) {
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function addTag(value) {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
    }
    setTagInput('');
  }

  function handleTagKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(prev => prev.slice(0, -1));
    }
  }

  function removeTag(tag) {
    setTags(prev => prev.filter(t => t !== tag));
  }

  async function handleSubmit() {
    if (!title.trim() || !categoryId || !content.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    const payload = { categoryId, title: title.trim(), content: content.trim() };
    try {
      if (isEdit) {
        await updateQna(questionId, payload);
      } else {
        await createQna(payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (isEdit ? '질문 수정에 실패했습니다.' : '질문 등록에 실패했습니다.')
      );
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalTop}>
          <div className={styles.modalTitleWrap}>
            <h2 className={styles.title}>{isEdit ? '질문 수정' : '질문 작성'}</h2>
            <p className={styles.subtitle}>
              {isEdit
                ? '접수 상태의 질문만 수정할 수 있어요.'
                : '문서로 해결되지 않는 내용을 담당자에게 남겨요.'}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>질문 제목</label>
            <input
              className={styles.input}
              placeholder="VPN 연결은 되는데 사내 시스템이 열리지 않아요"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className={styles.field} ref={catRef}>
            <label className={styles.fieldLabel}>카테고리</label>
            <div
              className={`${styles.select} ${catOpen ? styles.selectOpen : ''}`}
              onClick={() => setCatOpen(o => !o)}
            >
              <span className={selectedCategory ? styles.selectValue : styles.selectPlaceholder}>
                {selectedCategory ? selectedCategory.name : '카테고리를 선택하세요'}
              </span>
              <span className={`${styles.selectArrow} ${catOpen ? styles.selectArrowUp : ''}`}>
                <IconChevronDown />
              </span>
            </div>
            {catOpen && (
              <ul className={styles.dropdown}>
                {categories.map(opt => (
                  <li
                    key={opt.categoryId}
                    className={`${styles.dropdownItem} ${opt.categoryId === categoryId ? styles.dropdownItemActive : ''}`}
                    onClick={() => {
                      setCategoryId(opt.categoryId);
                      setCatOpen(false);
                    }}
                  >
                    {opt.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>내용</label>
            <textarea
              className={styles.textarea}
              placeholder="재택근무 중 VPN 연결은 성공으로 보이는데 사내 시스템 접속이 실패합니다. 어떤 정보를 같이 전달하면 될까요?"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>관련 태그</label>
            <div className={styles.tagWrap}>
              {tags.map(tag => (
                <span key={tag} className={styles.tag}>
                  {tag}
                  <button className={styles.tagRemove} onClick={() => removeTag(tag)}>
                    <IconX />
                  </button>
                </span>
              ))}
              <input
                className={styles.tagInput}
                placeholder={tags.length === 0 ? '태그 입력 후 Enter' : ''}
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => tagInput.trim() && addTag(tagInput)}
              />
            </div>
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
            disabled={!title.trim() || !categoryId || !content.trim() || submitting}
          >
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
  );
}

export default QnaQuestionModal;
