import { useState, useEffect, useRef } from 'react';
import styles from './QnaQuestionModal.module.css';

const DEPT_OPTIONS = ['개발', '인프라', '보안', '네트워크', '공통'];

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

function QnaQuestionModal({ onClose }) {
  const [title, setTitle] = useState('');
  const [dept, setDept] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [deptOpen, setDeptOpen] = useState(false);
  const deptRef = useRef(null);

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
      if (deptRef.current && !deptRef.current.contains(e.target)) setDeptOpen(false);
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

  function handleSubmit() {
    if (!title.trim() || !dept || !content.trim()) return;
    onClose();
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalTop}>
          <div className={styles.modalTitleWrap}>
            <h2 className={styles.title}>질문 작성</h2>
            <p className={styles.subtitle}>문서로 해결되지 않는 내용을 담당자에게 남겨요.</p>
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

          <div className={styles.field} ref={deptRef}>
            <label className={styles.fieldLabel}>부서</label>
            <div
              className={`${styles.select} ${deptOpen ? styles.selectOpen : ''}`}
              onClick={() => setDeptOpen(o => !o)}
            >
              <span className={dept ? styles.selectValue : styles.selectPlaceholder}>
                {dept || '부서를 선택하세요'}
              </span>
              <span className={`${styles.selectArrow} ${deptOpen ? styles.selectArrowUp : ''}`}>
                <IconChevronDown />
              </span>
            </div>
            {deptOpen && (
              <ul className={styles.dropdown}>
                {DEPT_OPTIONS.map(opt => (
                  <li
                    key={opt}
                    className={`${styles.dropdownItem} ${opt === dept ? styles.dropdownItemActive : ''}`}
                    onClick={() => {
                      setDept(opt);
                      setDeptOpen(false);
                    }}
                  >
                    {opt}
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

        <div className={styles.modalActions}>
          <button className={styles.btnOutline} onClick={onClose}>
            취소
          </button>
          <button
            className={styles.btnPrimary}
            onClick={handleSubmit}
            disabled={!title.trim() || !dept || !content.trim()}
          >
            등록하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default QnaQuestionModal;
