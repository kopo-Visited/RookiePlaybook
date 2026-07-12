import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import styles from './AdminLayout.module.css';
import { ROUTES } from '../../constants/routes';
import useAuthStore from '../../stores/authStore';
import { logout as logoutApi } from '../../api/authApi';
import { getAccountUnlockRequests } from '../../api/accountUnlockApi';
import logoImg from '../../assets/logo.png';

function formatRelativeTime(iso) {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  if (day === 1) return '어제';
  if (day < 7) return `${day}일 전`;
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function IconHome() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M2.5 19a6.5 6.5 0 0113 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M16 4.6a3.2 3.2 0 010 6.3M21.5 19a5.8 5.8 0 00-4.5-5.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconFolder() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 6a1 1 0 011-1h5l2 2h9a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V6z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChatEllipses() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M7 9h.01M12 9h.01M17 9h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconBook() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 2h9l5 5v15a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M14 2v5h5M8 12h8M8 16h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconFileTray() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 4h16v10.5l-3 5.5H7l-3-5.5V4z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M4 14.5h5l1.5 2h3l1.5-2h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M16 2v4M8 2v4M3 10h18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

const NAV_ITEMS = [
  { to: ROUTES.ADMIN.DASHBOARD, label: '관리자 대시보드', icon: <IconHome /> },
  { to: ROUTES.ADMIN.USERS, label: '사용자 관리', icon: <IconUsers /> },
  { to: ROUTES.ADMIN.DOC, label: '콘텐츠 관리', icon: <IconFolder /> },
  { to: ROUTES.ADMIN.QNA, label: '답변 관리', icon: <IconChatEllipses /> },
  { to: ROUTES.ADMIN.EDU, label: '교육관리', icon: <IconBook /> },
  { to: ROUTES.ADMIN.INQUIRY, label: '문의 관리', icon: <IconFileTray /> },
  { to: ROUTES.ADMIN.SCHEDULE, label: '일정 관리', icon: <IconCalendar /> },
  { to: ROUTES.ADMIN.SETTINGS, label: '설정', icon: <IconSettings /> },
];

function AdminLayout() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const clearAuth = useAuthStore(state => state.logout);
  const displayName = user?.name ?? '관리자';
  const displayDept = user ? `${user.departmentName} · ${user.roleName}` : '';
  const avatarChar = displayName[0];

  const [pendingRequests, setPendingRequests] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    let ignore = false;
    getAccountUnlockRequests()
      .then(res => {
        if (ignore) return;
        const list = res?.data ?? [];
        setPendingRequests(list.filter(r => r.status === 'PENDING'));
      })
      .catch(() => {
        if (!ignore) setPendingRequests([]);
      });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    function handleOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  function goToUnlockRequests(requestId) {
    setNotifOpen(false);
    navigate(ROUTES.ADMIN.SETTINGS, { state: { tab: 'unlock', requestId } });
  }

  async function handleLogout() {
    try {
      await logoutApi();
    } catch {
      // JWT는 stateless라 서버 호출이 실패해도 클라이언트 로그아웃은 진행한다
    } finally {
      clearAuth();
      navigate(ROUTES.LOGIN);
    }
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <img src={logoImg} alt="신입의 정석" className={styles.logoIcon} />
          <span className={styles.logoText}>신입의 정석</span>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === ROUTES.ADMIN.DASHBOARD}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
            >
              <span className={styles.navIcon}>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className={styles.mainWrapper}>
        <header className={styles.topbar}>
          <div className={styles.notifWrap} ref={notifRef}>
            <button
              type="button"
              className={styles.notifBtn}
              onClick={() => setNotifOpen(o => !o)}
              aria-label="알림"
            >
              <span className={styles.notifIcon}>
                <IconBell />
              </span>
              {pendingRequests.length > 0 && (
                <span className={styles.notifBadge}>{pendingRequests.length}</span>
              )}
            </button>
            {notifOpen && (
              <div className={styles.notifPanel}>
                <div className={styles.notifPanelHeader}>
                  <span className={styles.notifPanelTitle}>계정 잠금해제 요청</span>
                </div>
                <ul className={styles.notifList}>
                  {pendingRequests.length === 0 && (
                    <li className={styles.notifEmpty}>대기 중인 요청이 없습니다.</li>
                  )}
                  {pendingRequests.slice(0, 5).map(req => (
                    <li
                      key={req.requestId}
                      className={styles.notifItem}
                      onClick={() => goToUnlockRequests(req.requestId)}
                    >
                      <span className={styles.notifItemTitle}>{req.name}님 계정 잠금해제 요청</span>
                      <span className={styles.notifItemTime}>
                        {formatRelativeTime(req.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
                {pendingRequests.length > 0 && (
                  <button className={styles.notifPanelMore} onClick={() => goToUnlockRequests()}>
                    전체보기 ›
                  </button>
                )}
              </div>
            )}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{avatarChar}</div>
            <div className={styles.userText}>
              <span className={styles.userName}>{displayName}님</span>
              {displayDept && <span className={styles.userDept}>{displayDept}</span>}
            </div>
          </div>
          <button
            type="button"
            className={styles.logoutBtn}
            onClick={handleLogout}
            aria-label="로그아웃"
          >
            <IconLogout />
          </button>
        </header>

        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
