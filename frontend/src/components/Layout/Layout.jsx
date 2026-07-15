import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';
import { ROUTES } from '../../constants/routes';
import useAuthStore from '../../stores/authStore';
import NotificationPanel from '../NotificationPanel/NotificationPanel';
import AiChatModal from '../AiChatModal/AiChatModal';
import { getNotifications, markNotificationRead, deleteAllNotifications } from '../../api/qnaApi';
import { logout as logoutApi } from '../../api/authApi';
import chatbotImg from '../../assets/chatbot.png';
import logoImg from '../../assets/logo.png';

// 알림 이벤트 타입 → 상태 뱃지(칩)용 상태값 매핑
const NOTIF_TYPE_TO_STATUS = {
  ANSWER_REGISTERED: 'ANSWERED',
  STATUS_CHANGED: 'IN_PROGRESS',
};

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

// 백엔드 알림 응답 → NotificationPanel 표시용 형태로 변환
function mapNotification(n) {
  return {
    id: n.notificationId,
    questionId: n.questionId,
    status: NOTIF_TYPE_TO_STATUS[n.type] ?? n.type,
    title: n.message,
    time: formatRelativeTime(n.createdAt),
    read: n.isRead,
  };
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

function IconDoc() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 2h9l5 5v15a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M14 2v5h5M8 12h8M8 16h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconGraduate() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L2 7l10 5 10-5-10-5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M6 10v5c0 2.21 2.69 4 6 4s6-1.79 6-4v-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect
        x="2"
        y="4"
        width="20"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M2 7l10 7 10-7"
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
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M16 2v4M8 2v4M3 10h18"
        stroke="currentColor"
        strokeWidth="1.8"
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

const NAV_ITEMS = [
  { to: ROUTES.DASHBOARD, label: '대시보드', icon: <IconHome /> },
  { to: ROUTES.DOC.LIST, label: '지식문서', icon: <IconDoc /> },
  { to: ROUTES.QNA.ALL, label: '질문·답변', icon: <IconChat /> },
  { to: ROUTES.EDU.LIST, label: '온보딩 교육', icon: <IconGraduate /> },
  { to: ROUTES.SCHEDULE, label: '내 일정', icon: <IconCalendar /> },
  { to: ROUTES.INQUIRY, label: '문의하기', icon: <IconMail /> },
];

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore(state => state.user);
  const clearAuth = useAuthStore(state => state.logout);

  const displayName = user?.name ?? '윤정연';
  const displayDept = user ? `${user.departmentName} · ${user.roleName}` : '인사팀 · 사원';
  const avatarChar = displayName[0];

  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    let ignore = false;
    getNotifications()
      .then(res => {
        if (ignore) return;
        const list = res?.data?.content ?? [];
        setNotifications(list.map(mapNotification));
      })
      .catch(() => {
        if (!ignore) setNotifications([]);
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

  const markRead = id => {
    const notif = notifications.find(n => n.id === id);
    setNotifications(list => list.map(n => (n.id === id ? { ...n, read: true } : n)));
    markNotificationRead(id).catch(() => {});
    setNotifOpen(false);
    // 알림 클릭 시 해당 질문 상세로 이동 (내 질문 화면에서 모달 오픈)
    if (notif?.questionId != null) {
      navigate(ROUTES.QNA.LIST, { state: { openQuestionId: notif.questionId } });
    }
  };
  const markAllRead = () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    setNotifications(list => list.map(n => ({ ...n, read: true })));
    unreadIds.forEach(id => markNotificationRead(id).catch(() => {}));
  };
  const clearAll = () => {
    setNotifications([]);
    deleteAllNotifications().catch(() => {});
  };

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
          {NAV_ITEMS.map(({ to, label, icon }) => {
            // 공지사항(/notice)은 사이드바에 자체 메뉴가 없어 대시보드에서
            // 들어온 하위 화면으로 취급해 대시보드 메뉴를 계속 활성 상태로 보여준다.
            const forcedActive =
              (to === ROUTES.DASHBOARD && location.pathname === ROUTES.NOTICE.LIST) ||
              // 질문·답변 메뉴는 전체 QNA(/qna/all)로 가지만, 내 질문(/qna) 화면에서도 계속 활성 표시
              (to === ROUTES.QNA.ALL && location.pathname === ROUTES.QNA.LIST);
            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive || forcedActive ? styles.navItemActive : ''}`
                }
              >
                <span className={styles.navIcon}>{icon}</span>
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className={styles.helpCard}>
          <img src={chatbotImg} alt="AI 챗봇" className={styles.helpImg} />
          <p className={styles.helpTitle}>AI 챗봇이 도와드릴까요?</p>
          <p className={styles.helpDesc}>
            궁금한 내용을 바로 질문하고 정보를 빠르게 안내 받아 보세요.
          </p>
          <button className={styles.helpBtn} onClick={() => setAiOpen(true)}>
            <span>💬</span>
            <span>AI에게 물어보기</span>
          </button>
        </div>
        {aiOpen && <AiChatModal onClose={() => setAiOpen(false)} />}
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
              {unreadCount > 0 && <span className={styles.notifBadge}>{unreadCount}</span>}
            </button>
            {notifOpen && (
              <NotificationPanel
                notifications={notifications}
                onItemClick={markRead}
                onMarkAll={markAllRead}
                onClearAll={clearAll}
              />
            )}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{avatarChar}</div>
            <div className={styles.userText}>
              <span className={styles.userName}>{displayName}님</span>
              <span className={styles.userDept}>{displayDept}</span>
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

export default Layout;
