import styles from './DashboardPage.module.css';

/* ── 통계 카드 데이터 ── */
const statCards = [
  {
    bg: '#EAF4FF', iconColor: '#2288FF', icon: '📄',
    label: '전체 문서', value: '1,248',
    subIcon: '↑', subText: '12건 이번 주 업데이트', subColor: '#12B886',
  },
  {
    bg: '#E6F8F2', iconColor: '#12B886', icon: '📚',
    label: '진행 중 교육', value: '3',
    subIcon: '↑', subText: '1개 이번 주 시작', subColor: '#12B886',
  },
  {
    bg: '#FFF0F6', iconColor: '#FF4D94', icon: '❓',
    label: '미답변 질문', value: '2',
    subIcon: null, subText: '내가 작성한 질문', subColor: '#6B7588',
  },
  {
    bg: '#FFF5E6', iconColor: '#FFAD33', icon: '⭐',
    label: '북마크', value: '18',
    subIcon: null, subText: '관심 문서 및 교육', subColor: '#6B7588',
  },
];

/* ── 진행 중 교육 ── */
const eduItems = [
  {
    bg: '#EAF4FF', iconColor: '#2288FF', icon: '🏢',
    title: '회사 소개', required: true,
    pct: 75, chapter: '3/4', total: 4, dueDate: '2026.07.10',
  },
  {
    bg: '#FFF0F6', iconColor: '#FF4D94', icon: '🔒',
    title: '정보보안 교육', required: true,
    pct: 40, chapter: '2/5', total: 5, dueDate: '2026.07.12',
  },
  {
    bg: '#FFF5E6', iconColor: '#FFAD33', icon: '🛠',
    title: '업무 툴 사용법', required: false,
    pct: 20, chapter: '1/5', total: 5, dueDate: '2026.07.17',
  },
];

/* ── 최근 문서 ── */
const TYPE_STYLE = {
  DOCU: { bg: '#EAF4FF', color: '#2288FF' },
  PDF:  { bg: '#FFE5EA', color: '#F03E5C' },
  XLSX: { bg: '#DCF7EB', color: '#10A36C' },
  PPTX: { bg: '#FFF0DB', color: '#F08C00' },
  DOCX: { bg: '#E7F2FF', color: '#1C7ED6' },
};

const recentDocs = [
  { type: 'DOCU', title: '인사 제도 안내서 (2024년 개정)', category: '인사/제도', dept: '인사팀', date: '2026.07.06' },
  { type: 'PDF',  title: '연차휴가 및 휴직 규정',          category: '인사/제도', dept: '인사팀', date: '2026.06.27' },
  { type: 'XLSX', title: '2024년 복리후생 안내',           category: '복리후생',  dept: '총무팀', date: '2026.06.24' },
  { type: 'PPTX', title: '신입사원 온보딩 가이드',          category: '온보딩',   dept: 'HRD팀', date: '2026.06.23' },
  { type: 'DOCX', title: '사내 정보보안 가이드라인',         category: '정보보안', dept: '보안팀', date: '2026.06.03' },
];

/* ── 내 질문 현황 ── */
const myQuestions = [
  { bg: '#FFF0F6', title: '승진 기준이 어떻게 되나요?',       status: '답변 대기', category: '인사/제도', date: '2026.07.05', done: false },
  { bg: '#FFF5E6', title: '재택근무 신청 절차가 궁금합니다.',  status: '답변 대기', category: '근무/복지', date: '2026.06.27', done: false },
  { bg: '#E7F8F3', title: '연차 사용 시 주의사항이 있나요?',  status: '답변 완료', category: '인사/제도', date: '2026.06.24', done: true },
];

/* ── 공지사항 ── */
const notices = [
  { title: '2026년 하계 휴가 일정 안내', date: '2026.07.06', isNew: true },
  { title: '사내 시스템 점검 안내 (5/31)',     date: '2026.05.27', isNew: false },
  { title: '정보보안 교육 이수 필수 안내',      date: '2026.05.24', isNew: false },
  { title: '복지포인트 사용처 확대 안내',       date: '2026.05.22', isNew: false },
  { title: '사내 설문조사 참여 요청',           date: '2026.05.20', isNew: false },
];

/* ── 추천 문서 ── */
const recommendedDocs = [
  { type: 'PDF',  title: '입사자 체크리스트',     views: '1.2K', bookmarks: 24 },
  { type: 'DOCX', title: '근태관리 FAQ',          views: '856',  bookmarks: 18 },
  { type: 'PPTX', title: '커뮤니케이션 가이드',    views: '642',  bookmarks: 15 },
  { type: 'PDF',  title: '회계 처리 프로세스',     views: '532',  bookmarks: 12 },
  { type: 'XLSX', title: '비용 정산 양식 모음',    views: '421',  bookmarks: 9  },
];

/* ── 오늘의 일정 ── */
const schedules = [
  { time: '09:00', title: '주간 팀 회의',           place: '대회의실', dotColor: '#2288FF' },
  { time: '11:00', title: '신규 입사자 OT',          place: 'HR 교육장', dotColor: '#7C8CFF' },
  { time: '14:00', title: '프로젝트 진행 상황 공유', place: '회의실 A',  dotColor: '#4DABF7' },
  { time: '16:00', title: '성과 리뷰 미팅',          place: '회의실 B',  dotColor: '#9775FA' },
];

/* ── 빠른 바로가기 ── */
const shortcuts = [
  { bg: '#EAF4FF', color: '#2288FF', icon: '🔍', label: '문서 검색' },
  { bg: '#E6F8F2', color: '#12B886', icon: '📖', label: '교육 찾기' },
  { bg: '#FFF0F6', color: '#FF4D94', icon: '💬', label: '질문하기'  },
  { bg: '#FFF5E6', color: '#FFAD33', icon: '⭐', label: '즐겨찾기'  },
  { bg: '#F1EDFF', color: '#8B6CFF', icon: '📊', label: '내 활동'   },
  { bg: '#EEF3F9', color: '#637087', icon: '⚙️', label: '설정'      },
];

function DashboardPage() {
  return (
    <div className={styles.page}>
      {/* ── 헤더 ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>대시보드</h1>
          <p className={styles.pageSubtitle}>진행중인 교육과 수료 현황을 관리해요</p>
        </div>
      </div>

      {/* ── 한눈에 보기 ── */}
      <section className={styles.statsRow}>
        {statCards.map((card, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: card.bg }}>
              <span style={{ fontSize: 28 }}>{card.icon}</span>
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>{card.label}</span>
              <span className={styles.statValue}>{card.value}</span>
              <span className={styles.statSub} style={{ color: card.subColor }}>
                {card.subIcon && <span className={styles.statSubIcon}>{card.subIcon}</span>}
                {card.subText}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* ── 중단 3열 ── */}
      <div className={styles.midRow}>
        {/* 진행 중 교육 */}
        <section className={styles.card}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>진행 중 교육</span>
            <button className={styles.linkBtn}>전체보기 ›</button>
          </div>
          <ul className={styles.eduList}>
            {eduItems.map((edu, i) => (
              <li key={i} className={styles.eduItem}>
                <div className={styles.eduIcon} style={{ background: edu.bg }}>
                  <span style={{ fontSize: 24 }}>{edu.icon}</span>
                </div>
                <div className={styles.eduBody}>
                  <div className={styles.eduTitleRow}>
                    <span className={styles.eduTitle}>{edu.title}</span>
                    <span className={styles.badge} style={edu.required
                      ? { background: '#DFF1FF', color: '#2288FF' }
                      : { background: '#E2F8F0', color: '#099268' }}>
                      {edu.required ? '필수' : '선택'}
                    </span>
                  </div>
                  <div className={styles.eduProgressRow}>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${edu.pct}%` }} />
                    </div>
                    <span className={styles.progressPct}>{edu.pct}%</span>
                  </div>
                  <div className={styles.eduMeta}>
                    <span>{edu.chapter} 챕터 완료 · 예상 완료일 {edu.dueDate}</span>
                    <span>남은 학습 {edu.total - parseInt(edu.chapter)}개 챕터</span>
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
            <button className={styles.linkBtn}>전체보기 ›</button>
          </div>
          <ul className={styles.docList}>
            {recentDocs.map((doc, i) => {
              const ts = TYPE_STYLE[doc.type] ?? TYPE_STYLE.DOCU;
              return (
                <li key={i} className={styles.docItem}>
                  <span className={styles.docTypeBadge} style={{ background: ts.bg, color: ts.color }}>
                    {doc.type}
                  </span>
                  <span className={styles.docTitle}>{doc.title}</span>
                  <span className={styles.docMeta}>{doc.category}</span>
                  <span className={styles.docMeta}>{doc.dept}</span>
                  <span className={styles.docDate}>{doc.date}</span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* 내 질문 현황 */}
        <section className={styles.card}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>내 질문 현황</span>
          </div>
          <ul className={styles.qnaList}>
            {myQuestions.map((q, i) => (
              <li key={i} className={styles.qnaItem}>
                <div className={styles.qnaIcon} style={{ background: q.bg }}>
                  <span style={{ fontSize: 18 }}>{q.done ? '✅' : '❓'}</span>
                </div>
                <div className={styles.qnaBody}>
                  <span className={styles.qnaTitle}>{q.title}</span>
                  <span className={styles.qnaMeta}>
                    <span className={styles.qnaStatus} style={{ color: q.done ? '#20C997' : '#6F7B91' }}>
                      {q.status}
                    </span>
                    {' · '}{q.category}
                  </span>
                </div>
                <span className={styles.qnaDate}>{q.date}</span>
              </li>
            ))}
          </ul>
          <button className={styles.btnOutline}>질문하기</button>
        </section>
      </div>

      {/* ── 하단 4열 ── */}
      <div className={styles.bottomRow}>
        {/* 공지사항 */}
        <section className={styles.card}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>공지사항</span>
            <button className={styles.linkBtn}>전체보기 ›</button>
          </div>
          <ul className={styles.noticeList}>
            {notices.map((n, i) => (
              <li key={i} className={styles.noticeItem}>
                <span className={styles.noticeTitle}>
                  {n.title}
                  {n.isNew && <span className={styles.newBadge}>N</span>}
                </span>
                <span className={styles.noticeDate}>{n.date}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 추천 문서 */}
        <section className={styles.card}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>추천 문서</span>
            <button className={styles.linkBtn}>전체보기 ›</button>
          </div>
          <ul className={styles.docList}>
            {recommendedDocs.map((doc, i) => {
              const ts = TYPE_STYLE[doc.type] ?? TYPE_STYLE.DOCU;
              return (
                <li key={i} className={styles.docItem}>
                  <span className={styles.docTypeBadge} style={{ background: ts.bg, color: ts.color }}>
                    {doc.type}
                  </span>
                  <span className={styles.docTitle}>{doc.title}</span>
                  <span className={styles.docStat}>👁 {doc.views}</span>
                  <span className={styles.docStat}>🔖 {doc.bookmarks}</span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* 오늘의 일정 */}
        <section className={styles.card}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>오늘의 일정</span>
            <button className={styles.linkBtn}>전체보기 ›</button>
          </div>
          <div className={styles.scheduleDate}>
            <button className={styles.dateArrow}>‹</button>
            <span className={styles.dateTxt}>2026년 7월 6일 (월)</span>
            <button className={styles.dateArrow}>›</button>
          </div>
          <ul className={styles.scheduleList}>
            {schedules.map((s, i) => (
              <li key={i} className={styles.scheduleItem}>
                <div className={styles.scheduleLeft}>
                  <span className={styles.scheduleTime}>{s.time}</span>
                  <div className={styles.scheduleLine}>
                    <span className={styles.scheduleDot} style={{ background: s.dotColor }} />
                    {i < schedules.length - 1 && <span className={styles.scheduleConnector} />}
                  </div>
                </div>
                <div className={styles.scheduleRight}>
                  <span className={styles.scheduleTitle}>{s.title}</span>
                  <span className={styles.schedulePlace}>{s.place}</span>
                </div>
              </li>
            ))}
          </ul>
          <button className={styles.btnOutline}>📅 캘린더 열기</button>
        </section>

        {/* 빠른 바로가기 */}
        <section className={styles.card}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>빠른 바로가기</span>
          </div>
          <div className={styles.shortcutGrid}>
            {shortcuts.map((s, i) => (
              <button key={i} className={styles.shortcutItem}>
                <div className={styles.shortcutIcon} style={{ background: s.bg }}>
                  <span style={{ fontSize: 24 }}>{s.icon}</span>
                </div>
                <span className={styles.shortcutLabel}>{s.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default DashboardPage;
