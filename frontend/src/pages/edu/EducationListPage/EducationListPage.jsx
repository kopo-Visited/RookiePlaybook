import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EducationListPage.module.css';
import useFetch from '../../../hooks/useFetch';
import { getEducations } from '../../../api/eduApi';
import { ROUTES } from '../../../constants/routes';
import MyProgressModal from '../../../components/MyProgressModal/MyProgressModal';

const PAGE_SIZE = 10;

// 대시보드 "진행 중 교육"과 동일한 아이콘 색 팔레트 재사용
const EDU_COLORS = ['#EAF4FF', '#FFF0F6', '#FFF5E6', '#E6F8F2', '#F3EEFF'];
const EDU_ICON_COLORS = ['#2288FF', '#FF4D94', '#FFAD33', '#12B886', '#845EF7'];

// 진도 상태 → 상태 칩 (기존 색 토큰만 사용)
function statusChip(edu) {
  if (edu.isCompleted)
    return { label: '완료', bg: 'var(--color-green-bg)', color: 'var(--color-green)' };
  if (edu.progressRate > 0) return { label: '진행중', bg: '#DFF1FF', color: '#2288FF' };
  return { label: '미시작', bg: '#EEF1F6', color: 'var(--color-text-secondary)' };
}

function EducationListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [progressOpen, setProgressOpen] = useState(false);

  const {
    data: apiRes,
    loading,
    error,
  } = useFetch(() => getEducations({ page: page - 1, size: PAGE_SIZE }), [page]);

  const pageData = apiRes?.data;
  const educations = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 1;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>온보딩 교육</h1>
        <p className={styles.pageSubtitle}>
          신입사원이 이수해야 할 교육 과정과 내 진도 현황을 확인하세요.
        </p>
      </div>

      <section className={styles.listCard}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionTitle}>교육 과정</span>
          <button className={styles.linkBtn} onClick={() => setProgressOpen(true)}>
            내 학습 현황 ›
          </button>
        </div>

        {loading && <p className={styles.empty}>교육 과정을 불러오는 중...</p>}
        {error && <p className={styles.empty}>교육 과정을 불러오지 못했습니다.</p>}
        {!loading && !error && educations.length === 0 && (
          <p className={styles.empty}>등록된 교육 과정이 없습니다.</p>
        )}

        {!loading && !error && educations.length > 0 && (
          <ul className={styles.eduList}>
            {educations.map((edu, i) => {
              const chip = statusChip(edu);
              return (
                <li
                  key={edu.educationId}
                  className={styles.eduItem}
                  onClick={() => navigate(ROUTES.EDU.DETAIL(edu.educationId))}
                >
                  <div
                    className={styles.eduIcon}
                    style={{ background: EDU_COLORS[i % EDU_COLORS.length] }}
                  >
                    <span
                      style={{ fontSize: 24, color: EDU_ICON_COLORS[i % EDU_ICON_COLORS.length] }}
                    >
                      📖
                    </span>
                  </div>
                  <div className={styles.eduBody}>
                    <div className={styles.eduTitleRow}>
                      <span className={styles.eduTitle}>{edu.title}</span>
                      <span
                        className={styles.badge}
                        style={{ background: chip.bg, color: chip.color }}
                      >
                        {chip.label}
                      </span>
                      <span className={styles.stageCount}>
                        {edu.completedStages}/{edu.totalStages} 단계
                      </span>
                    </div>
                    <div className={styles.eduProgressRow}>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${edu.progressRate ?? 0}%` }}
                        />
                      </div>
                      <span className={styles.progressPct}>{edu.progressRate ?? 0}%</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageArrow}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                className={`${styles.pageNum} ${page === n ? styles.pageNumActive : ''}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              className={styles.pageArrow}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              ›
            </button>
          </div>
        )}
      </section>

      {progressOpen && <MyProgressModal onClose={() => setProgressOpen(false)} />}
    </div>
  );
}

export default EducationListPage;
