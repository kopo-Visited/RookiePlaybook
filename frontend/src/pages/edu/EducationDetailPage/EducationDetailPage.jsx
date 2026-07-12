import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './EducationDetailPage.module.css';
import useFetch from '../../../hooks/useFetch';
import { getEducationDetail, enroll } from '../../../api/eduApi';
import { ROUTES } from '../../../constants/routes';
import { BUTTON_VARIANTS, BUTTON_SIZES } from '../../../constants/styles';
import Button from '../../../components/Button/Button';
import Spinner from '../../../components/Spinner/Spinner';
import ErrorMessage from '../../../components/ErrorMessage/ErrorMessage';

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
  const [starting, setStarting] = useState(false);

  const courseChip = edu?.isCompleted
    ? { label: '완료', bg: 'var(--color-green-bg)', color: 'var(--color-green)' }
    : { label: '진행중', bg: '#DFF1FF', color: '#2288FF' };

  // 첫 미완료 단계(없으면 첫 단계)로 이동. 미수강이면 이동 전에 수강 처리한다.
  const firstIncomplete = (edu?.stages ?? []).find(s => !s.isCompleted) ?? edu?.stages?.[0];
  const startLabel = edu?.isCompleted
    ? '다시 보기'
    : edu?.enrolled
      ? '이어서 학습하기'
      : '수강하기';

  async function handleStart() {
    if (!firstIncomplete || starting) return;
    setStarting(true);
    if (!edu.enrolled) {
      // 안전망: enroll 실패해도 이동은 진행(영상 진입 시 재시도)
      try {
        await enroll(edu.educationId);
      } catch {
        /* noop */
      }
    }
    navigate(ROUTES.EDU.VIDEO(edu.educationId, firstIncomplete.stageId));
  }

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate(ROUTES.EDU.LIST)}>
        <IconArrowLeft />
        목록으로
      </button>

      {loading && <Spinner />}
      {!loading && error && <ErrorMessage message="교육 과정을 불러오지 못했습니다." />}

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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {edu.description && (
                <p className={styles.desc} style={{ flex: 1, margin: 0 }}>
                  {edu.description}
                </p>
              )}
              {firstIncomplete && (
                <Button
                  variant={BUTTON_VARIANTS.PRIMARY}
                  size={BUTTON_SIZES.SMALL}
                  onClick={handleStart}
                  disabled={starting}
                >
                  {startLabel}
                </Button>
              )}
            </div>
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
              {(edu.stages ?? []).map((stage, i) => {
                // 순차 잠금: 직전 단계를 완료하지 않았으면 잠긴다 (첫 단계는 항상 열림)
                const locked = i > 0 && !edu.stages[i - 1].isCompleted;
                return (
                  <li
                    key={stage.stageId}
                    className={styles.stageItem}
                    style={locked ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}
                    onClick={() => {
                      if (!locked) navigate(ROUTES.EDU.VIDEO(edu.educationId, stage.stageId));
                    }}
                  >
                    <div className={styles.stageOrder}>{stage.orderNumber}</div>
                    <div className={styles.stageBody}>
                      <div className={styles.stageTitleRow}>
                        <span className={styles.stageTitle}>{stage.title}</span>
                        {locked ? (
                          <span
                            className={styles.badge}
                            style={{ background: '#EEF1F6', color: 'var(--color-text-secondary)' }}
                          >
                            🔒 잠김
                          </span>
                        ) : (
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
                        )}
                      </div>
                      {stage.description && (
                        <span className={styles.stageDesc}>{stage.description}</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default EducationDetailPage;
