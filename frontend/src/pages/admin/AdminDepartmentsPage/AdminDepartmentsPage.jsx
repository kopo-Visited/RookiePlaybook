import { useMemo, useState } from 'react';
import styles from './AdminDepartmentsPage.module.css';
import useFetch from '../../../hooks/useFetch';
import useToastStore from '../../../stores/toastStore';
import { getDepartments, getAdminUsers, deleteDepartment } from '../../../api/adminUserApi';
import Spinner from '../../../components/Spinner/Spinner';
import ErrorMessage from '../../../components/ErrorMessage/ErrorMessage';
import EmptyState from '../../../components/EmptyState/EmptyState';
import Button from '../../../components/Button/Button';
import DepartmentFormModal from '../../../components/DepartmentFormModal/DepartmentFormModal';
import { COLOR_KEYS, BUTTON_VARIANTS, BUTTON_SIZES } from '../../../constants/styles';

function IconBuilding() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M8 7h1.5M8 11h1.5M8 15h1.5M14.5 7H16M14.5 11H16M14.5 15H16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M10 21v-4h4v4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function IconPerson() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 20a8 8 0 0116 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconAverage() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 19V9M10 19V5M16 19v-7M20 19v-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatCard({ label, value, colorKey, icon }) {
  return (
    <article className={styles.statCard}>
      <div className={`${styles.statIcon} ${styles[colorKey]}`}>{icon}</div>
      <div className={styles.statInfo}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statValue}>{value}</span>
      </div>
    </article>
  );
}

function buildMemberCounts(departments, users) {
  const counts = new Map();
  users.forEach(u => counts.set(u.departmentId, (counts.get(u.departmentId) ?? 0) + 1));
  return departments.map(dept => ({ ...dept, memberCount: counts.get(dept.departmentId) ?? 0 }));
}

function buildDeptDistribution(rows) {
  const max = Math.max(...rows.map(r => r.memberCount), 1);
  return rows
    .map(r => ({
      key: r.departmentId,
      label: r.name,
      value: r.memberCount,
      percent: (r.memberCount / max) * 100,
    }))
    .sort((a, b) => b.value - a.value);
}

function AdminDepartmentsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editDepartment, setEditDepartment] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    data: deptData,
    loading: deptLoading,
    error: deptError,
  } = useFetch(() => getDepartments().then(r => r.data ?? r), [refreshKey]);
  const { data: userData, loading: userLoading } = useFetch(
    () => getAdminUsers().then(r => r.data ?? r),
    [refreshKey]
  );

  const loading = deptLoading || userLoading;

  const rows = useMemo(
    () => buildMemberCounts(deptData ?? [], userData ?? []),
    [deptData, userData]
  );
  const users = userData ?? [];
  const distribution = useMemo(() => buildDeptDistribution(rows), [rows]);
  const totalMembers = users.length;
  const averagePerDept = rows.length ? Math.round(totalMembers / rows.length) : 0;

  function openCreate() {
    setEditDepartment(null);
    setModalOpen(true);
  }

  function openEdit(dept) {
    setEditDepartment(dept);
    setModalOpen(true);
  }

  async function handleDelete(dept) {
    if (!window.confirm(`"${dept.name}" 부서를 삭제하시겠습니까?`)) return;
    try {
      await deleteDepartment(dept.departmentId);
      setRefreshKey(k => k + 1);
    } catch (err) {
      useToastStore.getState().show(err.response?.data?.message || '부서 삭제에 실패했습니다.');
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>부서 관리</h1>
        <p className={styles.pageSubtitle}>
          부서를 등록·수정·삭제하고 부서별 인원 현황을 확인하세요.
        </p>
      </div>

      <div className={styles.statGrid}>
        <StatCard
          label="전체 부서"
          value={`${rows.length}개`}
          colorKey={COLOR_KEYS.BLUE}
          icon={<IconBuilding />}
        />
        <StatCard
          label="전체 소속 인원"
          value={`${totalMembers.toLocaleString()}명`}
          colorKey={COLOR_KEYS.GREEN}
          icon={<IconPerson />}
        />
        <StatCard
          label="부서당 평균 인원"
          value={`${averagePerDept}명`}
          colorKey={COLOR_KEYS.PINK}
          icon={<IconAverage />}
        />
      </div>

      <section className={styles.tablePanel}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>부서 목록</h2>
            <p className={styles.sectionSubtitle}>부서 코드와 이름을 확인하고 관리하세요.</p>
          </div>
          <Button
            variant={BUTTON_VARIANTS.PRIMARY}
            size={BUTTON_SIZES.MEDIUM}
            className={styles.registerButton}
            onClick={openCreate}
          >
            + 부서 추가
          </Button>
        </div>

        {loading ? (
          <Spinner />
        ) : deptError ? (
          <ErrorMessage />
        ) : rows.length === 0 ? (
          <EmptyState message="등록된 부서가 없습니다." />
        ) : (
          <table className={styles.deptTable}>
            <colgroup>
              <col style={{ width: '20%' }} />
              <col style={{ width: '32%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '30%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>부서 코드</th>
                <th>부서명</th>
                <th>인원수</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(dept => (
                <tr key={dept.departmentId}>
                  <td>
                    <span className={styles.secondary}>{dept.code}</span>
                  </td>
                  <td>
                    <span className={styles.titleText}>{dept.name}</span>
                  </td>
                  <td>{dept.memberCount.toLocaleString()}명</td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={styles.rowActionBtn}
                        onClick={() => openEdit(dept)}
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        className={`${styles.rowActionBtn} ${styles.rowActionBtnDanger}`}
                        onClick={() => handleDelete(dept)}
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
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>부서별 인원 현황</h2>
        <span className={styles.panelCaption}>전체 소속 인원 기준</span>

        {distribution.length > 0 ? (
          <ul className={styles.barList}>
            {distribution.map(({ key, label, value, percent }) => (
              <li key={key} className={styles.barItem}>
                <span className={styles.barLabel}>{label}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFillDynamic}
                    style={{ '--bar-color': '#4285F4', '--bar-percent': `${percent}%` }}
                  />
                </div>
                <span className={styles.barValue}>{value}명</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.panelCaption}>표시할 부서가 없습니다.</p>
        )}
      </section>

      {modalOpen && (
        <DepartmentFormModal
          department={editDepartment}
          onClose={() => setModalOpen(false)}
          onSuccess={() => setRefreshKey(k => k + 1)}
        />
      )}
    </div>
  );
}

export default AdminDepartmentsPage;
