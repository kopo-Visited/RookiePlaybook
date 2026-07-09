import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DocDetailModal.module.css';
import Badge from '../Badge/Badge';
import { COLOR_KEYS, BADGE_SIZES } from '../../constants/styles';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

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
  const navigate = useNavigate();
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
        <div className={styles.modalTop}>
          <div className={styles.modalTitleWrap}>
            <h2 className={styles.title}>{doc.title}</h2>
            <p className={styles.subtitle}>
              {doc.categoryName} · 등록일 {formatDate(doc.createdAt)}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className={styles.detailMeta}>
          <Badge colorKey={COLOR_KEYS.GREEN} size={BADGE_SIZES.SM}>{doc.categoryName}</Badge>
          {doc.tags?.map(tag => (
            <Badge key={tag} colorKey={COLOR_KEYS.BLUE} size={BADGE_SIZES.SM}>
              {tag}
            </Badge>
          ))}
        </div>

        <div className={styles.infoBox}>
          <p className={styles.infoTitle}>문서 내용</p>
          <p className={styles.infoText} style={{ whiteSpace: 'pre-wrap' }}>{doc.content}</p>
        </div>

        <div className={styles.modalActions}>
          <button className={styles.btnOutline}>북마크 저장</button>
          <button className={styles.btnPrimary} onClick={() => navigate(`/doc/${doc.id}`)}>문서 열기</button>
        </div>
      </div>
    </div>
  );
}

export default DocDetailModal;
