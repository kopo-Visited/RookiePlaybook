import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EducationListPage.module.css';
import useFetch from '../../../hooks/useFetch';
import useAuthStore from '../../../stores/authStore';
import { getEducations } from '../../../api/eduApi';
import { ROUTES } from '../../../constants/routes';
import MyProgressModal from '../../../components/MyProgressModal/MyProgressModal';
import Spinner from '../../../components/Spinner/Spinner';
import ErrorMessage from '../../../components/ErrorMessage/ErrorMessage';
import EmptyState from '../../../components/EmptyState/EmptyState';

const PAGE_SIZE = 10;
// 공통/부서 분리를 위해 전체 교육을 한 번에 받아 클라이언트에서 나눈다 (교육 과정 수보다 크게)
const FETCH_SIZE = 100;

// 대시보드 "진행 중 교육"과 동일한 아이콘 색 팔레트 재사용
const EDU_COLORS = ['#EAF4FF', '#FFF0F6', '#FFF5E6', '#E6F8F2', '#F3EEFF'];
const EDU_ICON_COLORS = ['#2288FF', '#FF4D94', '#FFAD33', '#12B886', '#845EF7'];

// 진도 상태 → 상태 칩 (기존 색 토큰만 사용)
function statusChip(edu) {
  if (edu.isCompleted)
    return { label: '완료', bg: 'var(--color-green-bg)', color: 'var(--color-green)' };
  if (edu.enrolled) return { label: '수강중', bg: '#DFF1FF', color: '#2288FF' };
  return { label: '미수강', bg: '#EEF1F6', color: 'var(--color-text-secondary)' };
}

// 교육 과정 섹션 (제목 + 목록 + 자체 페이지네이션). 공통/부서 섹션이 동일 구조라 재사용
function EduSection({ title, items }) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const paged = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section className={styles.listCard}>
      <div className={styles.sectionHead}>
        <span className={styles.sectionTitle}>{title}</span>
      </div>

      {items.length === 0 ? (
        <EmptyState message="등록된 교육 과정이 없습니다." />
      ) : (
        <ul className={styles.eduList}>
          {paged.map((edu, i) => {
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
                  <span style={{ fontSize: 24, color: EDU_ICON_COLORS[i % EDU_ICON_COLORS.length] }}>
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
  );
}

function EducationListPage() {
  const [progressOpen, setProgressOpen] = useState(false);
  const user = useAuthStore(state => state.user);
  const deptName = user?.departmentName;

  const {
    data: apiRes,
    loading,
    error,
  } = useFetch(() => getEducations({ page: 0, size: FETCH_SIZE }), []);

  const all = apiRes?.data?.content ?? [];
  // 공통(부서 미지정)과 내 부서 교육으로 분리
  const commonEdus = all.filter(edu => !edu.departmentName);
  const deptEdus = all.filter(edu => edu.departmentName);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>온보딩 교육</h1>
          <p className={styles.pageSubtitle}>
            신입사원이 이수해야 할 교육 과정과 내 진도 현황을 확인하세요.
          </p>
        </div>
        <button className={styles.linkBtn} onClick={() => setProgressOpen(true)}>
          내 학습 현황 ›
        </button>
      </div>

      {loading && <Spinner />}
      {!loading && error && <ErrorMessage message="교육 과정을 불러오지 못했습니다." />}
      {!loading && !error && (
        <>
          <EduSection title="공통 교육" items={commonEdus} />
          <EduSection title={deptName ? `${deptName} 교육` : '부서 교육'} items={deptEdus} />
        </>
      )}

      {progressOpen && <MyProgressModal onClose={() => setProgressOpen(false)} />}
    </div>
  );
}

export default EducationListPage;
