import { useEffect } from 'react';
import styles from './DocDetailModal.module.css';
import Badge from '../Badge/Badge';
import { COLOR_KEYS, BADGE_SIZES, DOC_TYPE_COLOR, DEPT_COLOR } from '../../constants/styles';

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

function DocDetailModal({ doc, onClose }) {
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

  if (!doc) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* 상단 타이틀 */}
        <div className={styles.modalTop}>
          <div className={styles.modalTitleWrap}>
            <h2 className={styles.title}>{doc.title}</h2>
            <p className={styles.subtitle}>
              {doc.dept}팀 · {doc.category} · 최근 검토 {doc.date}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <IconX />
          </button>
        </div>

        {/* 메타 뱃지 */}
        <div className={styles.detailMeta}>
          <Badge colorKey={DOC_TYPE_COLOR[doc.type]}>{doc.type}</Badge>
          <Badge colorKey={DEPT_COLOR[doc.dept] ?? COLOR_KEYS.BLUE} size={BADGE_SIZES.SM}>
            {doc.dept}
          </Badge>
          {doc.tags.map(tag => (
            <Badge key={tag} colorKey={COLOR_KEYS.BLUE} size={BADGE_SIZES.SM}>
              {tag}
            </Badge>
          ))}
        </div>

        {/* 문서 요약 */}
        <div className={styles.infoBox}>
          <p className={styles.infoTitle}>문서 요약</p>
          <p className={styles.infoText}>{doc.summary}</p>
        </div>

        {/* 핵심 체크리스트 */}
        <div className={styles.infoBox}>
          <p className={styles.infoTitle}>핵심 체크리스트</p>
          <ul className={styles.checkList}>
            {doc.checklist.map((item, i) => (
              <li key={i} className={styles.checkItem}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* 액션 버튼 */}
        <div className={styles.modalActions}>
          <button className={styles.btnOutline}>북마크 저장</button>
          <button className={styles.btnOutline}>AI에게 질문</button>
          <button className={styles.btnPrimary}>문서 열기</button>
        </div>
      </div>
    </div>
  );
}

export default DocDetailModal;
