import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminDocPage.module.css';
import useAuthStore from '../../../stores/authStore';
import { logout as logoutApi } from '../../../api/authApi';
import { ROUTES } from '../../../constants/routes';
import AdminDocModal from './AdminDocModal';

const STAT_CARDS = [
  {
    key: 'total',
    label: '전체 문서',
    value: '208건',
    sub: '▲ 12건 이번 달 추가',
    subColor: '#12B886',
    iconBg: '#EAF4FF',
    iconColor: '#2288FF',
    iconText: '문',
  },
  {
    key: 'public',
    label: '공개 문서',
    value: '186건',
    sub: '공개율 89.4%',
    subColor: '#12B886',
    iconBg: '#E6F8F2',
    iconColor: '#12B886',
    iconText: '공',
  },
  {
    key: 'review',
    label: '검토 필요',
    value: '14건',
    sub: '6개월 이상 미검토',
    subColor: '#FF4D94',
    iconBg: '#FFF0F6',
    iconColor: '#FF4D94',
    iconText: '!',
  },
  {
    key: 'faq',
    label: '등록 FAQ',
    value: '64건',
    sub: 'AI 추천 8건 포함',
    subColor: '#12B886',
    iconBg: '#FFF5E6',
    iconColor: '#FFAD33',
    iconText: 'Q',
  },
];

const DOC_ROWS = [
  {
    id: 1,
    type: 'DOCU',
    isMust: true,
    title: '개발 환경 세팅 가이드',
    dept: '개발팀',
    category: '환경 세팅',
    status: '공개',
    reviewedAt: '2026.07.06',
    author: '관리자',
  },
  {
    id: 2,
    type: 'DOCX',
    isMust: false,
    title: 'Git 브랜치 전략 및 PR 작성 규칙',
    dept: '개발팀',
    category: '협업 규칙',
    status: '공개',
    reviewedAt: '2026.07.02',
    author: '관리자',
  },
  {
    id: 3,
    type: 'PDF',
    isMust: true,
    title: '서버 접속 절차 및 Linux 기본 명령어',
    dept: '인프라팀',
    category: '서버 접속',
    status: '검토필요',
    reviewedAt: '2026.06.28',
    author: '관리자',
  },
  {
    id: 4,
    type: 'PDF',
    isMust: false,
    title: '계정 보안과 권한 신청 절차',
    dept: '보안팀',
    category: '권한 관리',
    status: '공개',
    reviewedAt: '2026.06.20',
    author: '관리자',
  },
  {
    id: 5,
    type: 'DOCX',
    isMust: true,
    title: 'VPN 접속 방법 및 오류 해결 가이드',
    dept: '네트워크팀',
    category: 'VPN',
    status: '공개',
    reviewedAt: '2026.06.12',
    author: '관리자',
  },
  {
    id: 6,
    type: 'XLSX',
    isMust: false,
    title: '방화벽 포트 오픈 요청 템플릿',
    dept: '네트워크팀',
    category: '요청 템플릿',
    status: '비공개',
    reviewedAt: '2026.06.08',
    author: '관리자',
  },
];

const DEPT_BARS = [
  { label: '개발팀', count: 48, ratio: 0.78 },
  { label: '인프라팀', count: 36, ratio: 0.58 },
  { label: '보안팀', count: 32, ratio: 0.52 },
  { label: '네트워크팀', count: 28, ratio: 0.45 },
];

const STALE_DOCS = [
  { id: 1, title: '서버 접속 절차 및 Linux 기본 명령어', dept: '인프라팀', daysAgo: 191 },
  { id: 2, title: 'VPN 오류 해결 가이드', dept: '네트워크팀', daysAgo: 182 },
];

const TYPE_STYLE = {
  DOCU: { bg: '#EAF4FF', color: '#2288FF' },
  DOCX: { bg: '#E7F2FF', color: '#1C7ED6' },
  PDF: { bg: '#FFE5EA', color: '#F03E5C' },
  XLSX: { bg: '#DCF7EB', color: '#10A36C' },
  PPTX: { bg: '#FFF5E6', color: '#F08C00' },
};

const STATUS_STYLE = {
  공개: { bg: '#E6F8F2', color: '#12B886' },
  비공개: { bg: '#EEF3F9', color: '#637087' },
  검토필요: { bg: '#FFF5E6', color: '#F08C00' },
};

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function StatCard({ label, value, sub, subColor, iconBg, iconColor, iconText }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statBody}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statValue}>{value}</span>
        <span className={styles.statSub} style={{ color: subColor }}>
          {sub}
        </span>
      </div>
      <div className={styles.statIcon} style={{ background: iconBg, color: iconColor }}>
        {iconText}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE['비공개'];
  return (
    <span className={styles.statusBadge} style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

function ActionButtons({ status }) {
  if (status === '검토필요') {
    return (
      <div className={styles.actionRow}>
        <button className={styles.actionBtn}>수정</button>
        <button className={styles.actionBtn}>검토완료</button>
      </div>
    );
  }
  if (status === '비공개') {
    return (
      <div className={styles.actionRow}>
        <button className={styles.actionBtn}>수정</button>
        <button className={styles.actionBtn}>공개</button>
      </div>
    );
  }
  return (
    <div className={styles.actionRow}>
      <button className={styles.actionBtn}>수정</button>
      <button className={styles.actionBtn}>비공개</button>
    </div>
  );
}

function AdminDocPage() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const clearAuth = useAuthStore(state => state.logout);
  const displayName = user?.name ?? '관리자';
  const avatarChar = displayName[0];

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

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = DOC_ROWS.filter(row => {
    const matchSearch = !search || row.title.includes(search) || row.category.includes(search);
    const matchDept = !deptFilter || row.dept === deptFilter;
    const matchType = !typeFilter || row.type === typeFilter;
    const matchStatus = !statusFilter || row.status === statusFilter;
    return matchSearch && matchDept && matchType && matchStatus;
  });

  const handleReset = () => {
    setSearch('');
    setDeptFilter('');
    setTypeFilter('');
    setStatusFilter('');
  };

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.titleBlock}>
          <h1 className={styles.pageTitle}>콘텐츠 관리</h1>
          <p className={styles.pageSubtitle}>
            사내 지식문서와 FAQ를 등록하고 공개 상태를 관리하세요.
          </p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>
              <IconSearch />
            </span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="문서, FAQ, 카테고리 검색"
            />
          </div>
          <div className={styles.profile}>
            <div className={styles.avatar}>{avatarChar}</div>
            <div className={styles.userText}>
              <span className={styles.userName}>{displayName}님</span>
              <span className={styles.userRole}>관리자</span>
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
        </div>
      </header>

      <div className={styles.statsGrid}>
        {STAT_CARDS.map(card => (
          <StatCard key={card.key} {...card} />
        ))}
      </div>

      <div className={styles.tableCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>문서 관리</h2>
            <p className={styles.sectionSubtitle}>사내 지식문서, 파일, 공개 상태를 관리하세요.</p>
          </div>
          <div className={styles.headerBtns}>
            <button className={styles.btnOutline}>+ FAQ 등록</button>
            <button className={styles.btnPrimary} onClick={() => setModalOpen(true)}>
              + 문서 등록
            </button>
          </div>
        </div>

        <div className={styles.filters}>
          <div className={styles.searchWrap}>
            <input
              type="text"
              className={styles.filterSearch}
              placeholder="문서명 또는 태그 검색"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className={styles.filterSelect}
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
          >
            <option value="">부서 전체</option>
            <option value="개발팀">개발팀</option>
            <option value="인프라팀">인프라팀</option>
            <option value="보안팀">보안팀</option>
            <option value="네트워크팀">네트워크팀</option>
          </select>
          <select
            className={styles.filterSelect}
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="">유형 전체</option>
            <option value="DOCU">DOCU</option>
            <option value="DOCX">DOCX</option>
            <option value="PDF">PDF</option>
            <option value="XLSX">XLSX</option>
          </select>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">상태 전체</option>
            <option value="공개">공개</option>
            <option value="비공개">비공개</option>
            <option value="검토필요">검토필요</option>
          </select>
          <button className={styles.resetBtn} onClick={handleReset}>
            초기화
          </button>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>유형</th>
              <th>문서명</th>
              <th>부서</th>
              <th>카테고리</th>
              <th>상태</th>
              <th>최근 검토</th>
              <th>작성자</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => {
              const typeStyle = TYPE_STYLE[row.type] ?? {};
              return (
                <tr key={row.id}>
                  <td>
                    <span
                      className={styles.typeBadge}
                      style={{ background: typeStyle.bg, color: typeStyle.color }}
                    >
                      {row.type}
                    </span>
                  </td>
                  <td>
                    <div className={styles.titleCell}>
                      {row.isMust && <span className={styles.mustBadge}>필독</span>}
                      <span className={styles.docTitle}>{row.title}</span>
                    </div>
                  </td>
                  <td className={styles.textCell}>{row.dept}</td>
                  <td className={styles.textCell}>{row.category}</td>
                  <td>
                    <StatusBadge status={row.status} />
                  </td>
                  <td className={styles.textCell}>{row.reviewedAt}</td>
                  <td className={styles.textCell}>{row.author}</td>
                  <td>
                    <ActionButtons status={row.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.bottomGrid}>
        <div className={styles.bottomCard}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>부서별 문서 현황</h2>
              <p className={styles.sectionSubtitle}>공개 문서 기준</p>
            </div>
            <span className={styles.totalBadge}>
              <span className={styles.totalDot} />총 208건
            </span>
          </div>
          <div className={styles.barList}>
            {DEPT_BARS.map(({ label, count, ratio }) => (
              <div key={label} className={styles.barRow}>
                <span className={styles.barLabel}>{label}</span>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${ratio * 100}%` }} />
                </div>
                <span className={styles.barCount}>{count}건</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.bottomCard}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>문서 신선도 관리</h2>
              <p className={styles.sectionSubtitle}>오래된 문서를 우선 검토하세요.</p>
            </div>
            <button className={styles.resetBtn}>전체보기</button>
          </div>
          <div className={styles.staleList}>
            {STALE_DOCS.map(doc => (
              <div key={doc.id} className={styles.staleItem}>
                <div className={styles.staleInfo}>
                  <span className={styles.staleTitle}>{doc.title}</span>
                  <span className={styles.staleMeta}>
                    {doc.dept} · 마지막 검토 {doc.daysAgo}일 전
                  </span>
                </div>
                <span className={styles.staleBadge}>검토필요</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {modalOpen && <AdminDocModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}

export default AdminDocPage;
