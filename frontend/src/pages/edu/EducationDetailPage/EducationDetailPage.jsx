import { useParams, useNavigate } from 'react-router-dom';
import styles from './EducationDetailPage.module.css';
import useFetch from '../../../hooks/useFetch';
import { getEducationDetail } from '../../../api/eduApi';
import { ROUTES } from '../../../constants/routes';

function IconArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M19 12H5M5 12l7 7M5 12l7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EducationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: apiRes, loading, error } = useFetch(() => getEducationDetail(id), [id]);
  const edu = apiRes?.data;

  const courseChip = edu?.isCompleted
    ? { label: '완료', bg: 'var(--color-green-bg)', color: 'var(--color-green)' }
    : { label: '진행중', bg: '#DFF1FF', color: '#2288FF' };

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate(ROUTES.EDU.LIST)}>
        <IconArrowLeft />
        목록으로
      </button>

      {loading && <p className={styles.stateMsg}>교육 과정을 불러오는 중...</p>}
      {error && <p className={styles.stateMsg}>교육 과정을 불러오지 못했습니다.</p>}

      {edu && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.titleWrap}>
              <h1 className={styles.title}>{edu.title}</h1>
              <div className={styles.meta}>
                <span
                  className={styles.badge}
                  style={{ background: courseChip.bg, color: courseChip.color }}
                >
                  {courseChip.label}
                </span>
                <span className={styles.criteria}>수료 기준 {edu.completionCriteria}%</span>
              </div>
            </div>
            {edu.description && <p className={styles.desc}>{edu.description}</p>}
            <div className={styles.progressRow}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${edu.progressRate ?? 0}%` }}
                />
              </div>
              <span className={styles.progressPct}>{edu.progressRate ?? 0}%</span>
            </div>
          </div>

          <hr className={styles.divider} />

          <div className={styles.stageSection}>
            <span className={styles.stageHeading}>단계 ({edu.stages?.length ?? 0})</span>
            <ul className={styles.stageList}>
              {(edu.stages ?? []).map(stage => (
                <li key={stage.stageId} className={styles.stageItem}>
                  <div className={styles.stageOrder}>{stage.orderNumber}</div>
                  <div className={styles.stageBody}>
                    <div className={styles.stageTitleRow}>
                      <span className={styles.stageTitle}>{stage.title}</span>
                      <span
                        className={styles.badge}
                        style={{
                          background: stage.isCompleted ? 'var(--color-green-bg)' : '#EEF1F6',
                          color: stage.isCompleted
                            ? 'var(--color-green)'
                            : 'var(--color-text-secondary)',
                        }}
                      >
                        {stage.isCompleted ? '완료' : '미완료'}
                      </span>
                    </div>
                    {stage.description && (
                      <span className={styles.stageDesc}>{stage.description}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default EducationDetailPage;
