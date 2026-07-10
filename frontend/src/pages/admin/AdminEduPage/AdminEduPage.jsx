import { useState } from 'react';
import styles from './AdminEduPage.module.css';
import useFetch from '../../../hooks/useFetch';
import {
  getEducations,
  getEducationDetail,
  deleteEducation,
  getAdminProgress,
} from '../../../api/eduApi';
import { getDepartments } from '../../../api/adminUserApi';
import { formatDate } from '../../../utils/formatDate';
import Spinner from '../../../components/Spinner/Spinner';
import ErrorMessage from '../../../components/ErrorMessage/ErrorMessage';
import EmptyState from '../../../components/EmptyState/EmptyState';
import EducationFormModal from '../../../components/EducationFormModal/EducationFormModal';
import StageManageModal from '../../../components/StageManageModal/StageManageModal';

const PROGRESS_PAGE_SIZE = 20;

const COMPLETION_OPTIONS = [
  { value: 'ALL', label: '완료여부 전체' },
  { value: 'true', label: '완료' },
  { value: 'false', label: '미완료' },
];

const TABS = [
  { key: 'course', label: '교육 과정 관리' },
  { key: 'progress', label: '진도 현황' },
];

function EducationSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editEducation, setEditEducation] = useState(null);
  const [stageEducation, setStageEducation] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data, loading, error } = useFetch(
    () => getEducations({ page: 0, size: 100 }),
    [refreshKey]
  );
  const items = data?.data?.content ?? [];

  function openCreate() {
    setEditEducation(null);
    setModalOpen(true);
  }

  async function openEdit(edu) {
    // 목록 응답엔 설명·수료 기준이 없어 상세를 받아 폼을 prefill한다
    try {
      const res = await getEducationDetail(edu.educationId);
      setEditEducation(res?.data ?? null);
      setModalOpen(true);
    } catch {
      alert('교육 과정 정보를 불러오지 못했습니다.');
    }
  }

  async function handleDelete(edu) {
    if (!window.confirm(`"${edu.title}" 교육 과정을 삭제하시겠습니까?`)) return;
    try {
      await deleteEducation(edu.educationId);
      setRefreshKey(k => k + 1);
    } catch (err) {
      // 단계·진도가 있으면 백엔드가 409로 막으므로 그 사유를 그대로 보여준다
      alert(err.response?.data?.message || '교육 과정 삭제에 실패했습니다.');
    }
  }

  return (
    <section className={styles.tableCard}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>교육 과정 목록</h2>
          <p className={styles.sectionSubtitle}>교육 과정을 등록·수정·삭제하세요.</p>
        </div>
        <button className={styles.btnPrimary} onClick={openCreate}>
          + 과정 추가
        </button>
      </div>

      {loading && <Spinner />}
      {!loading && error && <ErrorMessage />}
      {!loading && !error && items.length === 0 && (
        <EmptyState message="등록된 교육 과정이 없습니다." />
      )}
      {!loading && !error && items.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>제목</th>
              <th>단계 수</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {items.map(edu => (
              <tr key={edu.educationId}>
                <td>
                  <span className={styles.titleText}>{edu.title}</span>
                </td>
                <td>
                  <span className={styles.secondary}>{edu.totalStages}단계</span>
                </td>
                <td>
                  <div className={styles.actionRow}>
                    <button className={styles.actionBtn} onClick={() => setStageEducation(edu)}>
                      단계 관리
                    </button>
                    <button className={styles.actionBtn} onClick={() => openEdit(edu)}>
                      수정
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                      onClick={() => handleDelete(edu)}
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <EducationFormModal
          education={editEducation}
          onClose={() => setModalOpen(false)}
          onSuccess={() => setRefreshKey(k => k + 1)}
        />
      )}

      {stageEducation && (
        <StageManageModal
          education={stageEducation}
          onClose={() => {
            setStageEducation(null);
            // 단계 수가 바뀌었을 수 있으니 과정 목록을 다시 조회한다
            setRefreshKey(k => k + 1);
          }}
        />
      )}
    </section>
  );
}

// 진도율 셀 (EducationListPage 진도 바 패턴 재사용)
function ProgressBar({ rate }) {
  const value = rate ?? 0;
  return (
    <div className={styles.progressCell}>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${value}%` }} />
      </div>
      <span className={styles.progressPct}>{value}%</span>
    </div>
  );
}

// 페이지네이션 (EducationListPage 패턴 재사용, 1-based)
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className={styles.pagination}>
      <button
        className={styles.pageArrow}
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
      >
        ‹
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
        <button
          key={n}
          className={`${styles.pageNum} ${page === n ? styles.pageNumActive : ''}`}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}
      <button
        className={styles.pageArrow}
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
      >
        ›
      </button>
    </div>
  );
}

function ProgressSection() {
  const [departmentId, setDepartmentId] = useState('ALL');
  const [educationId, setEducationId] = useState('ALL');
  const [isCompleted, setIsCompleted] = useState('ALL');
  const [page, setPage] = useState(1);

  // 필터 옵션 (마운트 시 1회 로드)
  const { data: deptData } = useFetch(() => getDepartments(), []);
  const { data: eduData } = useFetch(() => getEducations({ page: 0, size: 100 }), []);
  const departments = deptData ?? [];
  const educations = eduData?.data?.content ?? [];

  const { data, loading, error } = useFetch(() => {
    const params = { page: page - 1, size: PROGRESS_PAGE_SIZE };
    if (departmentId !== 'ALL') params.departmentId = departmentId;
    if (educationId !== 'ALL') params.educationId = educationId;
    if (isCompleted !== 'ALL') params.isCompleted = isCompleted;
    return getAdminProgress(params);
  }, [departmentId, educationId, isCompleted, page]);

  const pageData = data?.data;
  const rows = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 1;

  // 필터 변경 시 첫 페이지로 되돌린다
  function changeFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  function resetFilters() {
    setDepartmentId('ALL');
    setEducationId('ALL');
    setIsCompleted('ALL');
    setPage(1);
  }

  return (
    <section className={styles.tableCard}>
      <div className={styles.filterRow}>
        <select
          className={styles.filterSelect}
          value={departmentId}
          onChange={e => changeFilter(setDepartmentId, e.target.value)}
        >
          <option value="ALL">부서 전체</option>
          {departments.map(dept => (
            <option key={dept.departmentId} value={dept.departmentId}>
              {dept.name}
            </option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={educationId}
          onChange={e => changeFilter(setEducationId, e.target.value)}
        >
          <option value="ALL">과정 전체</option>
          {educations.map(edu => (
            <option key={edu.educationId} value={edu.educationId}>
              {edu.title}
            </option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={isCompleted}
          onChange={e => changeFilter(setIsCompleted, e.target.value)}
        >
          {COMPLETION_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button type="button" className={styles.resetBtn} onClick={resetFilters}>
          초기화
        </button>
      </div>

      {loading && <Spinner />}
      {!loading && error && <ErrorMessage />}
      {!loading && !error && rows.length === 0 && (
        <EmptyState message="조건에 맞는 진도 현황이 없습니다." />
      )}
      {!loading && !error && rows.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>이름</th>
              <th>부서</th>
              <th>과정</th>
              <th>진도율</th>
              <th>완료여부</th>
              <th>최근 학습일</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={`${row.userId}-${i}`}>
                <td>
                  <span className={styles.titleText}>{row.userName}</span>
                </td>
                <td className={styles.secondary}>{row.departmentName}</td>
                <td>{row.educationTitle}</td>
                <td>
                  <ProgressBar rate={row.progressRate} />
                </td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${row.isCompleted ? styles.statusBadgeDone : ''}`}
                  >
                    {row.isCompleted ? '완료' : '미완료'}
                  </span>
                </td>
                <td className={styles.secondary}>{formatDate(row.lastStudiedAt) || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </section>
  );
}

function AdminEduPage() {
  const [tab, setTab] = useState('course');

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>교육 관리</h1>
        <p className={styles.pageSubtitle}>교육 과정과 신입사원 진도를 관리하세요.</p>
      </div>

      <div className={styles.tabRow}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`${styles.tabBtn} ${tab === t.key ? styles.tabBtnActive : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'course' ? <EducationSection /> : <ProgressSection />}
    </div>
  );
}

export default AdminEduPage;
