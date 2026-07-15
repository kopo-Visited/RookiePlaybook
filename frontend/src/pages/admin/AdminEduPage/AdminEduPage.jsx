import { useState } from 'react';
import styles from './AdminEduPage.module.css';
import useFetch from '../../../hooks/useFetch';
import useToastStore from '../../../stores/toastStore';
import {
  getAdminEducations,
  getEducationDetail,
  deleteEducation,
  getAdminProgress,
  getIncomplete,
} from '../../../api/eduApi';
import { getDepartments } from '../../../api/adminUserApi';
import { formatDate } from '../../../utils/formatDate';
import Spinner from '../../../components/Spinner/Spinner';
import ErrorMessage from '../../../components/ErrorMessage/ErrorMessage';
import EmptyState from '../../../components/EmptyState/EmptyState';
import EducationFormModal from '../../../components/EducationFormModal/EducationFormModal';
import StageManageModal from '../../../components/StageManageModal/StageManageModal';
import Dropdown from '../../../components/Dropdown/Dropdown';
import { DEPT_COLOR } from '../../../constants/styles';

const PROGRESS_PAGE_SIZE = 20;
const COURSE_PAGE_SIZE = 10;
// 검색/요약을 위해 전체 교육을 한 번에 받아온다 (교육 과정 수보다 크게)
const COURSE_FETCH_SIZE = 100;

// 교육 카테고리 (지식문서와 동일 집합·순서, 인사팀 제외)
const EDU_CATEGORIES = ['네트워크', '보안', '인프라', '개발', '공통'];
const CATEGORY_ICON = { 개발: 'Dev', 인프라: 'Infra', 보안: 'Sec', 네트워크: 'Net', 공통: 'All' };
const EDU_SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'oldest', label: '오래된순' },
  { value: 'title', label: '제목순' },
];

// 교육의 부서명 → 카테고리 (부서명의 '팀' 접미사 제거, 부서 미지정=공통)
function eduCategory(edu) {
  return edu.departmentName ? edu.departmentName.replace(/팀$/, '') : '공통';
}

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const COMPLETION_OPTIONS = [
  { value: 'ALL', label: '완료여부 전체' },
  { value: 'true', label: '완료' },
  { value: 'false', label: '미완료' },
];

// 진도 현황 탭 내부 세그먼트 (FR-009 진도 현황 / FR-010 미완료자)
const PROGRESS_MODES = [
  { key: 'progress', label: '진도 현황' },
  { key: 'incomplete', label: '미완료자' },
];

const TABS = [
  { key: 'course', label: '교육 과정 관리' },
  { key: 'progress', label: '학습 현황' },
];

function EducationSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editEducation, setEditEducation] = useState(null);
  const [stageEducation, setStageEducation] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('전체');
  const [sort, setSort] = useState('latest');

  // 전체 교육을 받아 검색/부서/정렬을 클라이언트에서 처리한다 (지식문서 목록과 동일 방식)
  const { data, loading, error } = useFetch(
    () => getAdminEducations({ page: 0, size: COURSE_FETCH_SIZE }),
    [refreshKey]
  );
  const allItems = data?.data?.content ?? [];

  // 등록/수정 폼의 부서 선택지. 인사팀은 교육 카테고리가 아니므로 제외
  const { data: deptData } = useFetch(() => getDepartments(), []);
  const departments = (deptData ?? []).filter(d => d.name !== '인사팀');

  // 부서별 교육 개수 요약 (고정 5개 카테고리, 0 포함)
  const countMap = allItems.reduce((acc, e) => {
    const c = eduCategory(e);
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});
  const summaryCards = EDU_CATEGORIES.map(name => ({
    name,
    colorKey: DEPT_COLOR[name],
    count: countMap[name] ?? 0,
  }));

  // 검색(제목) + 부서 + 정렬 필터 후 10개씩 페이지네이션
  let filtered = allItems;
  if (search.trim()) filtered = filtered.filter(e => e.title.includes(search.trim()));
  if (category !== '전체') filtered = filtered.filter(e => eduCategory(e) === category);
  filtered = [...filtered].sort((a, b) => {
    if (sort === 'oldest') return a.educationId - b.educationId;
    if (sort === 'title') return a.title.localeCompare(b.title, 'ko');
    return b.educationId - a.educationId;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / COURSE_PAGE_SIZE));
  const items = filtered.slice((page - 1) * COURSE_PAGE_SIZE, page * COURSE_PAGE_SIZE);

  // 필터 변경 시 항상 첫 페이지로 되돌린다
  function changeSearch(v) {
    setSearch(v);
    setPage(1);
  }
  function changeCategory(v) {
    setCategory(v);
    setPage(1);
  }
  function changeSort(v) {
    setSort(v);
    setPage(1);
  }
  function toggleCategoryCard(name) {
    setCategory(prev => (prev === name ? '전체' : name));
    setPage(1);
  }

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
      useToastStore.getState().show('교육 과정 정보를 불러오지 못했습니다.');
    }
  }

  async function handleDelete(edu) {
    if (!window.confirm(`"${edu.title}" 교육 과정을 삭제하시겠습니까?`)) return;
    try {
      await deleteEducation(edu.educationId);
      // 현재 페이지의 마지막 항목을 지웠고 첫 페이지가 아니면 이전 페이지로, 아니면 새로고침
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        setRefreshKey(k => k + 1);
      }
    } catch (err) {
      // 단계·진도가 있으면 백엔드가 409로 막으므로 그 사유를 그대로 보여준다
      useToastStore
        .getState()
        .show(err.response?.data?.message || '교육 과정 삭제에 실패했습니다.');
    }
  }

  return (
    <>
      <section className={styles.filterCard}>
        <div className={styles.eduFilterRow}>
          <div className={`${styles.filterField} ${styles.filterFieldWide}`}>
            <label className={styles.filterLabel}>검색어</label>
            <div className={styles.inputWrap}>
              <input
                className={styles.searchInput}
                placeholder="교육 과정명을 입력하세요"
                value={search}
                onChange={e => changeSearch(e.target.value)}
              />
              <span className={styles.inputIcon}>
                <IconSearch />
              </span>
            </div>
          </div>
          <div className={styles.filterField}>
            <label className={styles.filterLabel}>카테고리</label>
            <Dropdown
              className={styles.filterSelect}
              value={category}
              onChange={changeCategory}
              options={[
                { value: '전체', label: '전체' },
                ...EDU_CATEGORIES.map(c => ({ value: c, label: c })),
              ]}
            />
          </div>
          <div className={styles.filterField}>
            <label className={styles.filterLabel}>정렬</label>
            <Dropdown
              className={styles.filterSelect}
              value={sort}
              onChange={changeSort}
              options={EDU_SORT_OPTIONS}
            />
          </div>
        </div>

        <div className={styles.summaryRow}>
          {summaryCards.map(c => (
            <div
              key={c.name}
              className={`${styles.summaryCard} ${category === c.name ? styles.summaryCardActive : ''}`}
              onClick={() => toggleCategoryCard(c.name)}
            >
              <div className={`${styles.summaryIcon} ${styles[c.colorKey]}`}>
                {CATEGORY_ICON[c.name]}
              </div>
              <div className={styles.summaryText}>
                <span className={styles.summaryCount}>{c.count}</span>
                <span className={styles.summaryLabel}>{c.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

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
          <EmptyState
            message={
              allItems.length === 0
                ? '등록된 교육 과정이 없습니다.'
                : '조건에 맞는 교육 과정이 없습니다.'
            }
          />
        )}
        {!loading && !error && items.length > 0 && (
          <table className={`${styles.table} ${styles.courseTable}`}>
            <colgroup>
              <col className={styles.colEduTitle} />
              <col className={styles.colEduYear} />
              <col className={styles.colEduNum} />
              <col className={styles.colEduActions} />
            </colgroup>
            <thead>
              <tr>
                <th>제목</th>
                <th>기준연도</th>
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
                    <span className={styles.secondary}>
                      {edu.contentYear ? `${edu.contentYear} 과정` : '—'}
                    </span>
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

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />

        {modalOpen && (
          <EducationFormModal
            education={editEducation}
            departments={departments}
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
    </>
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

function ProgressView({ departments, educations }) {
  const [departmentId, setDepartmentId] = useState('ALL');
  const [educationId, setEducationId] = useState('ALL');
  const [isCompleted, setIsCompleted] = useState('ALL');
  const [page, setPage] = useState(1);

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
    <>
      <div className={styles.filterRow}>
        <Dropdown
          className={styles.filterSelect}
          value={departmentId}
          onChange={val => changeFilter(setDepartmentId, val)}
          options={[
            { value: 'ALL', label: '부서 전체' },
            ...departments.map(dept => ({ value: dept.departmentId, label: dept.name })),
          ]}
        />

        <Dropdown
          className={styles.filterSelect}
          value={educationId}
          onChange={val => changeFilter(setEducationId, val)}
          options={[
            { value: 'ALL', label: '과정 전체' },
            ...educations.map(edu => ({ value: edu.educationId, label: edu.title })),
          ]}
        />

        <Dropdown
          className={styles.filterSelect}
          value={isCompleted}
          onChange={val => changeFilter(setIsCompleted, val)}
          options={COMPLETION_OPTIONS}
        />

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
          <colgroup>
            <col className={styles.colName} />
            <col className={styles.colDept} />
            <col />
            <col className={styles.colProgress} />
            <col className={styles.colStatus} />
            <col className={styles.colDate} />
          </colgroup>
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
    </>
  );
}

function IncompleteView({ educations }) {
  const [educationId, setEducationId] = useState('ALL');
  const [page, setPage] = useState(1);

  const { data, loading, error } = useFetch(() => {
    const params = { page: page - 1, size: PROGRESS_PAGE_SIZE };
    if (educationId !== 'ALL') params.educationId = educationId;
    return getIncomplete(params);
  }, [educationId, page]);

  const pageData = data?.data;
  const rows = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 1;

  function changeEducation(value) {
    setEducationId(value);
    setPage(1);
  }

  function resetFilters() {
    setEducationId('ALL');
    setPage(1);
  }

  return (
    <>
      <div className={styles.filterRow}>
        <Dropdown
          className={styles.filterSelect}
          value={educationId}
          onChange={changeEducation}
          options={[
            { value: 'ALL', label: '과정 전체' },
            ...educations.map(edu => ({ value: edu.educationId, label: edu.title })),
          ]}
        />

        <button type="button" className={styles.resetBtn} onClick={resetFilters}>
          초기화
        </button>
      </div>

      {loading && <Spinner />}
      {!loading && error && <ErrorMessage />}
      {!loading && !error && rows.length === 0 && (
        <EmptyState message="조건에 맞는 미완료자가 없습니다." />
      )}
      {!loading && !error && rows.length > 0 && (
        <table className={styles.table}>
          <colgroup>
            <col className={styles.colName} />
            <col className={styles.colDept} />
            <col />
            <col className={styles.colProgress} />
            <col className={styles.colDate} />
          </colgroup>
          <thead>
            <tr>
              <th>이름</th>
              <th>부서</th>
              <th>과정</th>
              <th>진도율</th>
              <th>수료 기준</th>
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
                <td className={`${styles.secondary} ${styles.criteriaCol}`}>
                  {row.completionCriteria}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </>
  );
}

function ProgressSection() {
  const [mode, setMode] = useState('progress');

  // 필터 옵션은 두 뷰가 공유하므로 세그먼트 전환과 무관하게 한 번만 조회한다
  const { data: deptData } = useFetch(() => getDepartments(), []);
  const { data: eduData } = useFetch(() => getAdminEducations({ page: 0, size: 100 }), []);
  const departments = deptData ?? [];
  const educations = eduData?.data?.content ?? [];

  return (
    <section className={styles.tableCard}>
      <div className={styles.tabRow}>
        {PROGRESS_MODES.map(m => (
          <button
            key={m.key}
            type="button"
            className={`${styles.tabBtn} ${mode === m.key ? styles.tabBtnActive : ''}`}
            onClick={() => setMode(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'progress' ? (
        <ProgressView departments={departments} educations={educations} />
      ) : (
        <IncompleteView educations={educations} />
      )}
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
