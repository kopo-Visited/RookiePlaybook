import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './AdminSettingsPage.module.css';
import useFetch from '../../../hooks/useFetch';
import { getDepartments } from '../../../api/adminUserApi';
import { getAdminNotices, deleteNotice } from '../../../api/noticeApi';
import {
  getAccountUnlockRequests,
  resolveAccountUnlockRequest,
} from '../../../api/accountUnlockApi';
import Spinner from '../../../components/Spinner/Spinner';
import ErrorMessage from '../../../components/ErrorMessage/ErrorMessage';
import EmptyState from '../../../components/EmptyState/EmptyState';
import DepartmentFormModal from '../../../components/DepartmentFormModal/DepartmentFormModal';
import NoticeFormModal from '../../../components/NoticeFormModal/NoticeFormModal';

const TABS = [
  { key: 'department', label: '부서 관리' },
  { key: 'notice', label: '공지사항 관리' },
  { key: 'unlock', label: '계정 잠금 해제' },
];

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function DepartmentSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editDepartment, setEditDepartment] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data, loading, error } = useFetch(
    () => getDepartments().then(r => r.data ?? r),
    [refreshKey]
  );
  const items = data ?? [];

  function openCreate() {
    setEditDepartment(null);
    setModalOpen(true);
  }

  function openEdit(dept) {
    setEditDepartment(dept);
    setModalOpen(true);
  }

  return (
    <section className={styles.tableCard}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>부서 목록</h2>
          <p className={styles.sectionSubtitle}>부서를 추가하거나 이름을 변경하세요.</p>
        </div>
        <button className={styles.btnPrimary} onClick={openCreate}>
          + 부서 추가
        </button>
      </div>

      {loading && <Spinner />}
      {!loading && error && <ErrorMessage />}
      {!loading && !error && items.length === 0 && <EmptyState message="등록된 부서가 없습니다." />}
      {!loading && !error && items.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>부서 코드</th>
              <th>부서명</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {items.map(dept => (
              <tr key={dept.departmentId}>
                <td>
                  <span className={styles.secondary}>{dept.code}</span>
                </td>
                <td>
                  <span className={styles.titleText}>{dept.name}</span>
                </td>
                <td>
                  <button className={styles.actionBtn} onClick={() => openEdit(dept)}>
                    이름 변경
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <DepartmentFormModal
          department={editDepartment}
          onClose={() => setModalOpen(false)}
          onSuccess={() => setRefreshKey(k => k + 1)}
        />
      )}
    </section>
  );
}

function NoticeSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editNotice, setEditNotice] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data, loading, error } = useFetch(
    () => getAdminNotices().then(r => r.data ?? r),
    [refreshKey]
  );
  const items = data ?? [];

  function openCreate() {
    setEditNotice(null);
    setModalOpen(true);
  }

  function openEdit(notice) {
    setEditNotice(notice);
    setModalOpen(true);
  }

  async function handleDelete(notice) {
    if (!window.confirm(`"${notice.title}" 공지사항을 삭제하시겠습니까?`)) return;
    try {
      await deleteNotice(notice.noticeId);
      setRefreshKey(k => k + 1);
    } catch {
      alert('공지사항 삭제에 실패했습니다.');
    }
  }

  return (
    <section className={styles.tableCard}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>공지사항 목록</h2>
          <p className={styles.sectionSubtitle}>
            로그인 화면과 대시보드에 노출되는 공지사항을 관리하세요.
          </p>
        </div>
        <button className={styles.btnPrimary} onClick={openCreate}>
          + 공지 등록
        </button>
      </div>

      {loading && <Spinner />}
      {!loading && error && <ErrorMessage />}
      {!loading && !error && items.length === 0 && (
        <EmptyState message="등록된 공지사항이 없습니다." />
      )}
      {!loading && !error && items.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>제목</th>
              <th>작성자</th>
              <th>등록일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {items.map(notice => (
              <tr key={notice.noticeId}>
                <td>
                  <span className={styles.titleText}>{notice.title}</span>
                </td>
                <td>
                  <span className={styles.secondary}>{notice.writerName}</span>
                </td>
                <td>
                  <span className={styles.secondary}>{formatDate(notice.createdAt)}</span>
                </td>
                <td>
                  <div className={styles.actionRow}>
                    <button className={styles.actionBtn} onClick={() => openEdit(notice)}>
                      수정
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                      onClick={() => handleDelete(notice)}
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
        <NoticeFormModal
          notice={editNotice}
          onClose={() => setModalOpen(false)}
          onSuccess={() => setRefreshKey(k => k + 1)}
        />
      )}
    </section>
  );
}

function UnlockRequestSection() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [resolvingId, setResolvingId] = useState(null);

  const { data, loading, error } = useFetch(
    () => getAccountUnlockRequests().then(r => r.data ?? r),
    [refreshKey]
  );
  const items = data ?? [];

  async function handleResolve(request) {
    if (!window.confirm(`${request.name}님의 계정 비밀번호를 초기화하고 잠금을 해제하시겠습니까?`))
      return;
    setResolvingId(request.requestId);
    try {
      await resolveAccountUnlockRequest(request.requestId);
      setRefreshKey(k => k + 1);
    } catch {
      alert('잠금해제 처리에 실패했습니다.');
    } finally {
      setResolvingId(null);
    }
  }

  return (
    <section className={styles.tableCard}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>계정 잠금해제 요청</h2>
          <p className={styles.sectionSubtitle}>
            비밀번호 5회 오입력으로 잠긴 계정의 해제 요청을 확인하고 처리하세요.
          </p>
        </div>
      </div>

      {loading && <Spinner />}
      {!loading && error && <ErrorMessage />}
      {!loading && !error && items.length === 0 && (
        <EmptyState message="접수된 잠금해제 요청이 없습니다." />
      )}
      {!loading && !error && items.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>이름</th>
              <th>이메일</th>
              <th>사번</th>
              <th>부서</th>
              <th>전화번호</th>
              <th>메모</th>
              <th>접수일</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {items.map(req => (
              <tr key={req.requestId}>
                <td>
                  <span className={styles.titleText}>{req.name}</span>
                </td>
                <td>
                  <span className={styles.secondary}>{req.email}</span>
                </td>
                <td>
                  <span className={styles.secondary}>{req.employeeNo}</span>
                </td>
                <td>
                  <span className={styles.secondary}>{req.departmentName}</span>
                </td>
                <td>
                  <span className={styles.secondary}>{req.phone}</span>
                </td>
                <td>
                  <span className={styles.secondary}>{req.memo || '-'}</span>
                </td>
                <td>
                  <span className={styles.secondary}>{formatDate(req.createdAt)}</span>
                </td>
                <td>
                  <span className={styles.secondary}>
                    {req.status === 'PENDING' ? '대기중' : '처리완료'}
                  </span>
                </td>
                <td>
                  <button
                    className={styles.actionBtn}
                    disabled={req.status === 'RESOLVED' || resolvingId === req.requestId}
                    onClick={() => handleResolve(req)}
                  >
                    {req.status === 'RESOLVED'
                      ? '처리완료'
                      : resolvingId === req.requestId
                        ? '처리 중...'
                        : '비밀번호 초기화'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function AdminSettingsPage() {
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.tab ?? 'department');

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>설정</h1>
        <p className={styles.pageSubtitle}>부서, 공지사항, 계정 잠금해제 요청을 관리하세요.</p>
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

      {tab === 'department' && <DepartmentSection />}
      {tab === 'notice' && <NoticeSection />}
      {tab === 'unlock' && <UnlockRequestSection />}
    </div>
  );
}

export default AdminSettingsPage;
