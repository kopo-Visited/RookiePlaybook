import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DashboardPage.module.css';
import useAuthStore from '../../../stores/authStore';
import useFetch from '../../../hooks/useFetch';
import { getDocuments } from '../../../api/docApi';
import { getQnas } from '../../../api/qnaApi';
import { getMyProgress } from '../../../api/eduApi';
import { getFaqs } from '../../../api/docApi';
import { getNotices } from '../../../api/noticeApi';
import { getSchedules, getUserSchedules } from '../../../api/scheduleApi';
import { ROUTES } from '../../../constants/routes';
import QnaQuestionModal from '../../../components/QnaQuestionModal/QnaQuestionModal';

const STATUS_STYLE = {
  RECEIVED: { label: '답변 대기', color: '#6F7B91' },
  IN_PROGRESS: { label: '처리 중', color: '#2288FF' },
  ANSWERED: { label: '답변 완료', color: '#20C997' },
  ON_HOLD: { label: '보류', color: '#F08C00' },
};

const EDU_COLORS = ['#EAF4FF', '#FFF0F6', '#FFF5E6', '#E6F8F2', '#F3EEFF'];
const EDU_ICON_COLORS = ['#2288FF', '#FF4D94', '#FFAD33', '#12B886', '#845EF7'];

const shortcuts = [
  { colorKey: 'blue', icon: <IconSearch />, label: '문서 검색', route: ROUTES.DOC.LIST },
  { colorKey: 'green', icon: <IconBook />, label: '교육 찾기', route: ROUTES.EDU.LIST },
  { colorKey: 'pink', icon: <IconChat />, label: '질문하기', route: null, action: 'qna' },
  { colorKey: 'purple', icon: <IconList />, label: 'FAQ 전체', route: ROUTES.QNA.ALL },
  { colorKey: 'orange', icon: <IconDocText />, label: '최근 문서', route: ROUTES.DOC.LIST },
];

function IconDocText() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
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
function IconAcademicCap() {
  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3L2 8l10 5 10-5-10-5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M6 11.5v5c0 2.21 2.69 4 6 4s6-1.79 6-4v-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconChatBubble() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
function IconStar() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function IconBook() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 19.5A2.5 2.5 0 016.5 17H20"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconChat() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconList() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
function todayLabel() {
  const d = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

function formatDate(str) {
  if (!str) return '';
  const d = new Date(str);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const [qnaModalOpen, setQnaModalOpen] = useState(false);
  const [qnaRefreshKey, setQnaRefreshKey] = useState(0);

  const { data: docRes } = useFetch(() => getDocuments().catch(() => null), []);
  const { data: qnaRes } = useFetch(() => getQnas().catch(() => null), [qnaRefreshKey]);
  const { data: eduRes } = useFetch(() => getMyProgress().catch(() => null), []);
  const { data: faqRes } = useFetch(() => getFaqs().catch(() => null), []);
  const { data: noticeRes } = useFetch(() => getNotices().catch(() => null), []);
  const { data: scheduleRes } = useFetch(() => getSchedules().catch(() => null), []);
  const { data: userScheduleRes } = useFetch(() => getUserSchedules().catch(() => null), []);
  const schedules = useMemo(() => {
    const toItem = s => ({
      id: s.id,
      time: s.startTime?.slice(0, 5) ?? '',
      title: s.title,
      place: s.place ?? '',
      dotColor: s.dotColor ?? '#2288FF',
    });
    const company = (scheduleRes?.data ?? []).map(toItem);
    const personal = (userScheduleRes?.data ?? []).map(toItem);
    return [...company, ...personal].sort((a, b) => a.time.localeCompare(b.time));
  }, [scheduleRes, userScheduleRes]);

  const docs = Array.isArray(docRes?.data) ? docRes.data : [];
  const qnaRaw = qnaRes?.data;
  const qnas = Array.isArray(qnaRaw?.content)
    ? qnaRaw.content
    : Array.isArray(qnaRaw)
      ? qnaRaw
      : [];
  const eduList = Array.isArray(eduRes?.data) ? eduRes.data : [];
  const faqs = Array.isArray(faqRes?.data) ? faqRes.data : [];
  const notices = Array.isArray(noticeRes?.data) ? noticeRes.data : [];

  const recentDocs = useMemo(
    () => [...docs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [docs]
  );

  const recentFaqs = useMemo(() => faqs.slice(0, 5), [faqs]);

  const myQnas = useMemo(() => qnas.slice(0, 3), [qnas]);

  const pendingCount = useMemo(
    () => qnas.filter(q => q.status === 'RECEIVED' || q.status === 'IN_PROGRESS').length,
    [qnas]
  );

  const inProgressEdu = useMemo(
    () => eduList.filter(e => !e.isCompleted && e.progressRate > 0).slice(0, 3),
    [eduList]
  );

  const statCards = [
    {
      colorKey: 'blue',
      icon: <IconDocText />,
      label: '전체 문서',
      value: docs.length > 0 ? `${docs.length}` : '—',
      subText: '지식문서 전체',
      subColor: '#2288FF',
    },
    {
      colorKey: 'green',
      icon: <IconAcademicCap />,
      label: '진행 중 교육',
      value: inProgressEdu.length > 0 ? `${inProgressEdu.length}` : '—',
      subText: '현재 수강 중',
      subColor: '#12B886',
    },
    {
      colorKey: 'pink',
      icon: <IconChatBubble />,
      label: '미답변 질문',
      value: `${pendingCount}`,
      subText: '내가 작성한 질문',
      subColor: '#6B7588',
    },
    {
      colorKey: 'orange',
      icon: <IconStar />,
      label: '등록 FAQ',
      value: '—',
      subText: '전체 FAQ 목록',
      subColor: '#6B7588',
    },
  ];

  function handleShortcut(s) {
    if (s.action === 'qna') {
      setQnaModalOpen(true);
      return;
    }
    if (s.route) navigate(s.route);
  }

  return (
    <div className={styles.page}>
      {/* ── 환영 헤더 ── */}
      <div className={styles.welcomeBanner}>
        <div className={styles.welcomeLeft}>
          <h1 className={styles.welcomeTitle}>
            안녕하세요, <span className={styles.welcomeName}>{user?.name ?? '신입사원'}님</span> 👋
          </h1>
          <p className={styles.welcomeSub}>
            오늘도 신입의 정석과 함께 성장해 보세요. 진행 중인 교육과 문서를 확인하세요.
          </p>
        </div>
        <div className={styles.welcomeDate}>{todayLabel()}</div>
      </div>

      {/* ── 통계 카드 ── */}
      <section className={styles.statsRow}>
        {statCards.map((card, i) => (
          <div key={i} className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles[card.colorKey]}`}>{card.icon}</div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>{card.label}</span>
              <span className={styles.statValue}>{card.value}</span>
              <span className={styles.statSub} style={{ color: card.subColor }}>
                {card.subText}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* ── 빠른 바로가기 ── */}
      <section className={styles.card}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionTitle}>빠른 바로가기</span>
        </div>
        <div className={styles.shortcutGridWide}>
          {shortcuts.map((s, i) => (
            <button key={i} className={styles.shortcutItem} onClick={() => handleShortcut(s)}>
              <div className={`${styles.shortcutIcon} ${styles[s.colorKey]}`}>{s.icon}</div>
              <span className={styles.shortcutLabel}>{s.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── 중단 3열 ── */}
      <div className={styles.midRow}>
        {/* 진행 중 교육 */}
        <section className={styles.card}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>진행 중 교육</span>
            <button className={styles.linkBtn} onClick={() => navigate(ROUTES.EDU.LIST)}>
              전체보기 ›
            </button>
          </div>
          <ul className={styles.eduList}>
            {inProgressEdu.length === 0 && (
              <li className={styles.emptyText}>진행 중인 교육이 없습니다.</li>
            )}
            {inProgressEdu.map((edu, i) => (
              <li key={edu.educationId ?? i} className={styles.eduItem}>
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
                      style={{ background: '#DFF1FF', color: '#2288FF' }}
                    >
                      진행중
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
            ))}
          </ul>
        </section>

        {/* 최근 문서 */}
        <section className={styles.card}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>최근 문서</span>
            <button className={styles.linkBtn} onClick={() => navigate(ROUTES.DOC.LIST)}>
              전체보기 ›
            </button>
          </div>
          <ul className={styles.docList}>
            {recentDocs.length === 0 && (
              <li className={styles.emptyText}>등록된 문서가 없습니다.</li>
            )}
            {recentDocs.map((doc, i) => (
              <li key={doc.id ?? i} className={styles.docItem}>
                <span
                  className={styles.docTypeBadge}
                  style={{ background: '#EAF4FF', color: '#2288FF' }}
                >
                  DOC
                </span>
                <span className={styles.docTitle}>{doc.title}</span>
                <span className={styles.docMeta}>{doc.categoryName}</span>
                <span className={styles.docDate}>{formatDate(doc.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 내 질문 현황 */}
        <section className={styles.card}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>내 질문 현황</span>
            <button className={styles.linkBtn} onClick={() => navigate(ROUTES.QNA.LIST)}>
              전체보기 ›
            </button>
          </div>
          <ul className={styles.qnaList}>
            {myQnas.length === 0 && <li className={styles.emptyText}>등록한 질문이 없습니다.</li>}
            {myQnas.map((q, i) => {
              const st = STATUS_STYLE[q.status] ?? STATUS_STYLE.RECEIVED;
              const isDone = q.status === 'ANSWERED';
              return (
                <li key={q.questionId ?? i} className={styles.qnaItem}>
                  <div
                    className={styles.qnaIcon}
                    style={{ background: isDone ? '#E7F8F3' : '#FFF0F6' }}
                  >
                    <span style={{ fontSize: 18 }}>{isDone ? '✅' : '❓'}</span>
                  </div>
                  <div className={styles.qnaBody}>
                    <span className={styles.qnaTitle}>{q.title}</span>
                    <span className={styles.qnaMeta}>
                      <span className={styles.qnaStatus} style={{ color: st.color }}>
                        {st.label}
                      </span>
                      {q.categoryName && <> · {q.categoryName}</>}
                    </span>
                  </div>
                  <span className={styles.qnaDate}>{formatDate(q.createdAt)}</span>
                </li>
              );
            })}
          </ul>
          <button className={styles.btnOutline} onClick={() => setQnaModalOpen(true)}>
            + 질문하기
          </button>
        </section>
      </div>

      {/* ── 하단 4열 ── */}
      <div className={styles.bottomRow}>
        {/* 공지사항 */}
        <section className={styles.card}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>공지사항</span>
            <button className={styles.linkBtn} onClick={() => navigate(ROUTES.NOTICE.LIST)}>
              전체보기 ›
            </button>
          </div>
          <ul className={styles.noticeList}>
            {notices.length === 0 && (
              <li className={styles.emptyText}>등록된 공지사항이 없습니다.</li>
            )}
            {notices.map(n => (
              <li key={n.noticeId} className={styles.noticeItem}>
                <span className={styles.noticeTitle}>
                  {n.title}
                  {n.isNew && <span className={styles.newBadge}>N</span>}
                </span>
                <span className={styles.noticeDate}>{formatDate(n.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 최근 FAQ */}
        <section className={styles.card}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>자주 묻는 질문</span>
            <button className={styles.linkBtn} onClick={() => navigate(ROUTES.QNA.ALL)}>
              전체보기 ›
            </button>
          </div>
          <ul className={styles.noticeList}>
            {recentFaqs.length === 0 && (
              <li className={styles.emptyText}>등록된 FAQ가 없습니다.</li>
            )}
            {recentFaqs.map(faq => (
              <li key={faq.id} className={styles.noticeItem}>
                <span className={styles.noticeTitle}>
                  <span style={{ color: '#2288FF', fontWeight: 900, marginRight: 6 }}>Q.</span>
                  {faq.question}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* 오늘의 일정 */}
        <section className={styles.card}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>오늘의 일정</span>
          </div>
          <div className={styles.scheduleDate}>
            <span className={styles.dateTxt}>{todayLabel()}</span>
          </div>
          <ul className={styles.scheduleList}>
            {schedules.length === 0 && (
              <li className={styles.scheduleEmpty}>오늘 등록된 일정이 없습니다.</li>
            )}
            {schedules.map(s => (
              <li key={s.id} className={styles.scheduleItem}>
                <div className={styles.scheduleLeft}>
                  <span className={styles.scheduleTime}>{s.time}</span>
                  <div className={styles.scheduleLine}>
                    <span className={styles.scheduleDot} style={{ background: s.dotColor }} />
                  </div>
                </div>
                <div className={styles.scheduleRight}>
                  <span className={styles.scheduleTitle}>{s.title}</span>
                  <span className={styles.schedulePlace}>{s.place}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {qnaModalOpen && (
        <QnaQuestionModal
          onClose={() => setQnaModalOpen(false)}
          onSuccess={() => {
            setQnaRefreshKey(k => k + 1);
            setQnaModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default DashboardPage;
