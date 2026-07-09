import { useState, useCallback, useMemo } from 'react';
import styles from './AdminDocPage.module.css';
import useAuthStore from '../../../stores/authStore';
import AdminDocModal from './AdminDocModal';
import useFetch from '../../../hooks/useFetch';
import { getDocuments, getFaqs } from '../../../api/docApi';


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

function StatCard({ label, value, sub, subColor, colorKey, iconText }) {
  return (
    <div className={styles.statCard}>
      <div className={`${styles.statIcon} ${styles[colorKey]}`}>
        {iconText}
      </div>
      <div className={styles.statBody}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statValue}>{value}</span>
        <span className={styles.statSub} style={{ color: subColor }}>
          {sub}
        </span>
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

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function AdminDocPage() {
  const user = useAuthStore(state => state.user);
  const displayName = user?.name ?? '관리자';
  const avatarChar = displayName[0];

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: apiRes, loading } = useFetch(() => getDocuments(), [refreshKey]);
  const docs = apiRes?.data ?? [];

  const { data: faqRes } = useFetch(() => getFaqs(), []);
  const totalFaqs = faqRes?.data?.length ?? 0;

  const statCards = useMemo(() => [
    { key: 'total',  label: '전체 문서',  value: `${docs.length}건`,  sub: '공개 문서 기준',      subColor: '#12B886', colorKey: 'blue',   iconText: 'Doc' },
    { key: 'public', label: '공개 문서',  value: `${docs.length}건`,  sub: `카테고리 ${[...new Set(docs.map(d => d.categoryName))].length}개`, subColor: '#12B886', colorKey: 'green',  iconText: 'Pub' },
    { key: 'review', label: '검토 필요',  value: '0건',                sub: '6개월 이상 미검토',   subColor: '#FF4D94', colorKey: 'pink',   iconText: 'Rev' },
    { key: 'faq',    label: '등록 FAQ',   value: `${totalFaqs}건`,    sub: '전체 FAQ 목록',       subColor: '#12B886', colorKey: 'orange', iconText: 'FAQ' },
  ], [docs, totalFaqs]);

  const filtered = docs.filter(row => {
    const matchSearch = !search || row.title.includes(search) || row.categoryName.includes(search);
    const matchCategory = !categoryFilter || row.categoryName === categoryFilter;
    const publicStatus = row.isPublic ? '공개' : '비공개';
    const matchStatus = !statusFilter || publicStatus === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  const handleCreated = useCallback(() => setRefreshKey(k => k + 1), []);

  const handleReset = () => {
    setSearch('');
    setCategoryFilter('');
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
        </div>
      </header>

      <div className={styles.statsGrid}>
        {statCards.map(card => (
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
              placeholder="문서명 또는 카테고리 검색"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className={styles.filterSelect}
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="">카테고리 전체</option>
            <option value="개발">개발</option>
            <option value="인프라">인프라</option>
            <option value="보안">보안</option>
            <option value="네트워크">네트워크</option>
          </select>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">상태 전체</option>
            <option value="공개">공개</option>
            <option value="비공개">비공개</option>
          </select>
          <button className={styles.resetBtn} onClick={handleReset}>
            초기화
          </button>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>문서명</th>
              <th>카테고리</th>
              <th>상태</th>
              <th>등록일</th>
              <th>조회수</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className={styles.textCell} style={{ textAlign: 'center', padding: '40px' }}>불러오는 중...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} className={styles.textCell} style={{ textAlign: 'center', padding: '40px' }}>문서가 없습니다.</td></tr>
            )}
            {!loading && filtered.map(row => {
              const publicStatus = row.isPublic ? '공개' : '비공개';
              return (
                <tr key={row.id}>
                  <td>
                    <span className={styles.docTitle}>{row.title}</span>
                  </td>
                  <td className={styles.textCell}>{row.categoryName}</td>
                  <td>
                    <StatusBadge status={publicStatus} />
                  </td>
                  <td className={styles.textCell}>{formatDate(row.createdAt)}</td>
                  <td className={styles.textCell}>{row.viewCount}</td>
                  <td>
                    <ActionButtons status={publicStatus} />
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
      {modalOpen && <AdminDocModal onClose={() => setModalOpen(false)} onCreated={handleCreated} />}
    </div>
  );
}

export default AdminDocPage;
