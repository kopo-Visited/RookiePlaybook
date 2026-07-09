import { useParams, useNavigate } from 'react-router-dom';
import styles from './DocDetailPage.module.css';
import Badge from '../../../components/Badge/Badge';
import { COLOR_KEYS, BADGE_SIZES } from '../../../constants/styles';
import { getDocument } from '../../../api/docApi';
import useFetch from '../../../hooks/useFetch';
import { ROUTES } from '../../../constants/routes';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function IconArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DocDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: apiRes, loading, error } = useFetch(() => getDocument(id), [id]);
  const doc = apiRes?.data;

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate(ROUTES.DOC.LIST)}>
        <IconArrowLeft />
        목록으로
      </button>

      {loading && <p className={styles.stateMsg}>문서를 불러오는 중...</p>}
      {error && <p className={styles.stateMsg}>문서를 불러오지 못했습니다.</p>}

      {doc && (
        <>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.titleWrap}>
                <h1 className={styles.title}>{doc.title}</h1>
                <div className={styles.meta}>
                  <Badge colorKey={COLOR_KEYS.GREEN} size={BADGE_SIZES.SM}>{doc.categoryName}</Badge>
                  {doc.tags?.map(tag => (
                    <Badge key={tag} colorKey={COLOR_KEYS.BLUE} size={BADGE_SIZES.SM}>{tag}</Badge>
                  ))}
                </div>
              </div>
              <div className={styles.info}>
                <span>조회수 {doc.viewCount}</span>
                <span>등록일 {formatDate(doc.createdAt)}</span>
                {doc.updatedAt && <span>수정일 {formatDate(doc.updatedAt)}</span>}
              </div>
            </div>

            <hr className={styles.divider} />

            <div className={styles.content}>
              {doc.content}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DocDetailPage;
