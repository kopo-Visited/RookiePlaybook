import { useNavigate } from 'react-router-dom';
import styles from './AdminDashboardPage.module.css';
import useDashboardStats from '../../../hooks/admin/useDashboardStats';
import { COLOR_KEYS } from '../../../constants/styles';
import { ROUTES } from '../../../constants/routes';
import { formatDate } from '../../../utils/formatDate';

const USER_STATUS_LABELS = { ACTIVE: '활성', INACTIVE: '비활성', DELETED: '탈퇴' };

function formatRelativeTime(isoString) {
  if (!isoString) return '';
  const diffMinutes = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffHours < 48) return '어제';
  return formatDate(isoString);
}

// 진행 중 교육은 Education 도메인이 아직 백엔드에 구현되지 않아 실 데이터를 낼 수 없다 (F-51 범위 제외).
const STAT_CARD_CONFIG = [
  {
    key: 'users',
    label: '전체 사용자',
    colorKey: COLOR_KEYS.BLUE,
    icon: <IconPerson />,
    to: ROUTES.ADMIN.USERS,
  },
  {
    key: 'docs',
    label: '전체 문서',
    colorKey: COLOR_KEYS.GREEN,
    icon: <IconDocText />,
    to: ROUTES.ADMIN.DOC,
  },
  {
    key: 'unanswered',
    label: '미답변 질문',
    colorKey: COLOR_KEYS.PINK,
    icon: <IconChatBubble />,
    to: ROUTES.ADMIN.QNA,
  },
  {
    key: 'inProgress',
    label: '진행 중 교육',
    colorKey: COLOR_KEYS.ORANGE,
    icon: <IconAcademicCap />,
    to: ROUTES.ADMIN.EDU,
    ready: false,
  },
];

function formatDelta(ratePercent) {
  const rounded = Math.abs(ratePercent).toFixed(1);
  if (ratePercent > 0) return { delta: `▲ ${rounded}%`, deltaDirection: 'up' };
  if (ratePercent < 0) return { delta: `▼ ${rounded}%`, deltaDirection: 'down' };
  return { delta: `- ${rounded}%`, deltaDirection: 'flat' };
}

function buildStatCardValues(stats) {
  if (!stats) return {};
  const {
    totalUsers,
    userGrowthRatePercent,
    totalDocuments,
    documentGrowthRatePercent,
    unansweredQuestions,
  } = stats;
  return {
    users: { value: `${totalUsers.toLocaleString()}명`, ...formatDelta(userGrowthRatePercent) },
    docs: {
      value: `${totalDocuments.toLocaleString()}개`,
      ...formatDelta(documentGrowthRatePercent),
    },
    unanswered: {
      value: `${unansweredQuestions.toLocaleString()}건`,
      deltaDirection: 'flat',
      delta: '',
    },
  };
}

const CATEGORY_COLORS = ['#2288FF', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE', '#EFF6FF'];

function buildCategoryDonutData(distribution) {
  if (!distribution || distribution.length === 0) return [];
  return distribution.map((item, index) => ({
    key: item.categoryName,
    label: item.categoryName,
    value: item.count,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));
}

const ACCESS_BUCKET_LABELS = ['00-03시', '04-07시', '08-11시', '12-15시', '16-19시', '20-23시'];

// 별도 접속 로그가 없어 사용자별 마지막 로그인 시각(hour)을 4시간 단위로 묶은 근사치다.
function buildAccessTrendBuckets(hourlyAccessTrend) {
  if (!hourlyAccessTrend) return [];
  return ACCESS_BUCKET_LABELS.map((label, bucketIndex) => {
    const startHour = bucketIndex * 4;
    const value = hourlyAccessTrend
      .slice(startHour, startHour + 4)
      .reduce((sum, h) => sum + h.count, 0);
    return { label, value };
  });
}

function buildRecentUsersRows(recentUsers) {
  if (!recentUsers) return [];
  return recentUsers.map(u => ({
    id: u.userId,
    name: u.name,
    dept: u.departmentName,
    position: u.position,
    email: u.email,
    joinedAt: formatDate(u.createdAt),
    statusLabel: USER_STATUS_LABELS[u.status] ?? u.status,
  }));
}

function buildRecentDocItems(recentDocuments) {
  if (!recentDocuments) return [];
  return recentDocuments.map(d => ({
    id: d.id,
    title: d.title,
    meta: `${d.categoryName} ㅣ ${formatDate(d.createdAt)}`,
  }));
}

function buildRecentQuestionItems(recentQuestions) {
  if (!recentQuestions) return [];
  return recentQuestions.map(q => ({
    id: q.id,
    title: q.title,
    meta: `${q.departmentName ?? '부서 미상'} ㅣ ${formatRelativeTime(q.createdAt)}`,
  }));
}

function IconPerson() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 20a8 8 0 0116 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

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

function IconAcademicCap() {
  return (
    <svg width="29" height="30" viewBox="0 0 24 24" fill="none">
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

function IconDocBadge() {
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

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function StatCard({ label, value, delta, deltaDirection, colorKey, icon, to, onNavigate }) {
  return (
    <button type="button" className={styles.statCard} onClick={() => onNavigate(to)}>
      <div className={`${styles.statIcon} ${styles[colorKey]}`}>{icon}</div>
      <div className={styles.statInfo}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statValue}>{value}</span>
        {delta && (
          <div className={styles.statFooter}>
            <span
              className={`${styles.statDelta} ${deltaDirection === 'down' ? styles.statDeltaDown : ''}`}
            >
              {delta}
            </span>
            <span className={styles.statDeltaCaption}>지난주 대비</span>
          </div>
        )}
      </div>
    </button>
  );
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function describeDonutSegment(cx, cy, outerR, innerR, startAngle, endAngle) {
  const startOuter = polarToCartesian(cx, cy, outerR, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerR, startAngle);
  const startInner = polarToCartesian(cx, cy, innerR, startAngle);
  const endInner = polarToCartesian(cx, cy, innerR, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    'M',
    startOuter.x,
    startOuter.y,
    'A',
    outerR,
    outerR,
    0,
    largeArc,
    0,
    endOuter.x,
    endOuter.y,
    'L',
    startInner.x,
    startInner.y,
    'A',
    innerR,
    innerR,
    0,
    largeArc,
    1,
    endInner.x,
    endInner.y,
    'Z',
  ].join(' ');
}

function DonutChart({ data, size = 200 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const center = size / 2;
  const outerR = size / 2 - 6;
  const innerR = outerR - size * 0.18;
  const gapDeg = 2;

  let acc = 0;
  const segments = data.map(({ key, value, color, label }) => {
    const sweep = (value / total) * 360;
    const start = acc + gapDeg / 2;
    const end = acc + sweep - gapDeg / 2;
    acc += sweep;
    return {
      key,
      color,
      label,
      value,
      d: describeDonutSegment(center, center, outerR, innerR, start, end),
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={styles.donutSvg}>
      {segments.map(({ key, color, label, value, d }) => (
        <path key={key} d={d} fill={color}>
          <title>
            {label} {value.toLocaleString()}
          </title>
        </path>
      ))}
    </svg>
  );
}

function DonutLegend({ data }) {
  return (
    <ul className={styles.legendList}>
      {data.map(({ key, label, value, color }) => (
        <li key={key} className={styles.legendItem}>
          <svg width="8" height="8" viewBox="0 0 8 8" className={styles.legendDot}>
            <circle cx="4" cy="4" r="4" fill={color} />
          </svg>
          <span className={styles.legendLabel}>{label}</span>
          <span className={styles.legendValue}>{value.toLocaleString()}개</span>
        </li>
      ))}
    </ul>
  );
}

function TrendChart({ data, width = 330, height = 160 }) {
  const values = data.map(d => d.value);
  const max = Math.max(Math.ceil(Math.max(...values) / 100) * 100, 1);
  const padding = { top: 8, right: 8, bottom: 24, left: 8 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const stepX = plotWidth / (data.length - 1);

  const points = data.map((d, i) => ({
    x: padding.left + i * stepX,
    y: padding.top + plotHeight - (d.value / max) * plotHeight,
    ...d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + plotHeight} L ${points[0].x} ${padding.top + plotHeight} Z`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={styles.trendSvg}
    >
      {gridLines.map(ratio => {
        const y = padding.top + plotHeight * ratio;
        return (
          <line
            key={ratio}
            x1={padding.left}
            x2={width - padding.right}
            y1={y}
            y2={y}
            stroke="#DDE1E6"
            strokeWidth="1"
          />
        );
      })}
      <path d={areaPath} fill="#2288FF" opacity="0.1" />
      <path
        d={linePath}
        fill="none"
        stroke="#2288FF"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {points.map(p => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r="6" fill="#FFFFFF" />
          <circle cx={p.x} cy={p.y} r="4" fill="#2288FF">
            <title>
              {p.label} {p.value.toLocaleString()}명
            </title>
          </circle>
          <text x={p.x} y={height - 6} textAnchor="middle" className={styles.trendAxisLabel}>
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function MoreLinkButton({ onClick }) {
  return (
    <button type="button" className={styles.moreLink} onClick={onClick}>
      전체 보기 ›
    </button>
  );
}

function ListPanel({ title, items, renderIcon, onMoreClick }) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <span className={styles.panelTitle}>{title}</span>
        <MoreLinkButton onClick={onMoreClick} />
      </div>
      <ul className={styles.itemList}>
        {items.map(item => (
          <li key={item.id} className={styles.listItem}>
            <span className={styles.listIcon}>{renderIcon(item)}</span>
            <span className={styles.listBody}>
              <span className={styles.listTitle}>{item.title}</span>
              <span className={styles.listMeta}>{item.meta}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function AdminDashboardPage() {
  const navigate = useNavigate();

  const { stats, loading: statsLoading } = useDashboardStats();
  const statCardValues = buildStatCardValues(stats);
  const categoryDonutData = buildCategoryDonutData(stats?.documentCategoryDistribution);
  const accessTrendData = buildAccessTrendBuckets(stats?.accessTrend);
  const recentLoginCount = stats?.accessTrend?.reduce((sum, h) => sum + h.count, 0) ?? 0;
  const recentUsersRows = buildRecentUsersRows(stats?.recentUsers);
  const recentDocItems = buildRecentDocItems(stats?.recentDocuments);
  const recentQuestionItems = buildRecentQuestionItems(stats?.recentQuestions);

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.searchBox}>
          <input type="text" className={styles.searchInput} placeholder="문서, 교육, 질문 검색" />
          <span className={styles.searchIcon}>
            <IconSearch />
          </span>
        </div>
      </header>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>관리자 대시보드</h1>
        <p className={styles.pageSubtitle}>진행중인 교육과 수료 현황을 관리해요</p>
      </div>

      <div className={styles.statGrid}>
        {STAT_CARD_CONFIG.map(({ key, ready, ...card }) => {
          const computed =
            ready === false
              ? { value: '준비 중', delta: '', deltaDirection: 'flat' }
              : (statCardValues[key] ?? {
                  value: statsLoading ? '—' : '0',
                  delta: '',
                  deltaDirection: 'flat',
                });
          return <StatCard key={key} {...card} {...computed} onNavigate={navigate} />;
        })}
      </div>

      <div className={styles.midGrid}>
        <section className={`${styles.panel} ${styles.usersPanel}`}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>사용자 관리</span>
            <MoreLinkButton onClick={() => navigate(ROUTES.ADMIN.USERS)} />
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.usersTable}>
              <thead>
                <tr>
                  <th>이름</th>
                  <th>부서</th>
                  <th>직급</th>
                  <th>이메일</th>
                  <th>가입일</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {recentUsersRows.map(
                  ({ id, name, dept, position, email, joinedAt, statusLabel }) => (
                    <tr key={id}>
                      <td>{name}</td>
                      <td>{dept}</td>
                      <td>{position}</td>
                      <td>{email}</td>
                      <td>{joinedAt}</td>
                      <td>
                        <span className={styles.statusBadge}>{statusLabel}</span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>문서 카테고리 분포</span>
            <MoreLinkButton onClick={() => navigate(ROUTES.ADMIN.DOC)} />
          </div>
          {categoryDonutData.length > 0 ? (
            <>
              <div className={styles.donutWrap}>
                <DonutChart data={categoryDonutData} />
              </div>
              <DonutLegend data={categoryDonutData} />
            </>
          ) : (
            <p className={styles.statDeltaCaption}>
              {statsLoading ? '불러오는 중...' : '등록된 문서가 없습니다.'}
            </p>
          )}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>교육 완료 현황</span>
            <MoreLinkButton onClick={() => navigate(ROUTES.ADMIN.EDU)} />
          </div>
          <p className={styles.statDeltaCaption}>Education 기능 연동 후 제공될 예정입니다.</p>
        </section>
      </div>

      <div className={styles.bottomGrid}>
        <ListPanel
          title="최근 등록 문서"
          items={recentDocItems}
          renderIcon={() => <IconDocBadge />}
          onMoreClick={() => navigate(ROUTES.ADMIN.DOC)}
        />
        <ListPanel
          title="최근 질문 현황"
          items={recentQuestionItems}
          renderIcon={() => <span className={styles.qMark}>Q</span>}
          onMoreClick={() => navigate(ROUTES.ADMIN.QNA)}
        />
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>운영 공지</span>
          </div>
          <p className={styles.statDeltaCaption}>공지사항 기능 연동 후 제공될 예정입니다.</p>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>접속 현황 (최근 로그인 기준)</span>
            <MoreLinkButton />
          </div>
          <div className={styles.trendHeader}>
            <span className={styles.trendValue}>{recentLoginCount.toLocaleString()}명</span>
          </div>
          {accessTrendData.length > 0 ? (
            <TrendChart data={accessTrendData} />
          ) : (
            <p className={styles.statDeltaCaption}>불러오는 중...</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
