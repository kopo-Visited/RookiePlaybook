import { useState, useMemo, useEffect } from 'react';
import styles from './AdminQnaPage.module.css';
import AdminQnaDetail from './AdminQnaDetail';
import { getAdminQnas } from '../../../api/qnaApi';
import { slidingPageWindow } from '../../../utils/pageWindow';
import { DEPT_COLOR, COLOR_KEYS, BADGE_SIZES } from '../../../constants/styles';
import Badge from '../../../components/Badge/Badge';
import Dropdown from '../../../components/Dropdown/Dropdown';

const QNA_STATUS_LABEL = {
  RECEIVED: '접수',
  IN_PROGRESS: '처리중',
  ANSWERED: '답변완료',
  ON_HOLD: '보류',
};

const QNA_STATUS_CLASS = {
  RECEIVED: 'stReceived',
  IN_PROGRESS: 'stInProgress',
  ANSWERED: 'stAnswered',
  ON_HOLD: 'stOnHold',
};

// 상태별 카드: 콘텐츠관리(AdminDocPage) 카드 스타일을 따르되 색은 보라색 제외 4색,
// 각 상태 고유색(접수=핑크/처리중=파랑/답변완료=초록/보류=주황)을 유지한다.
const STAT_CARDS = [
  { key: 'RECEIVED', label: '접수', color: 'pink', sub: '접수된 질문', iconText: '접수' },
  { key: 'IN_PROGRESS', label: '처리중', color: 'blue', sub: '처리 중인 질문', iconText: '처리' },
  { key: 'ANSWERED', label: '답변완료', color: 'green', sub: '답변 완료', iconText: '완료' },
  { key: 'ON_HOLD', label: '보류', color: 'orange', sub: '보류된 질문', iconText: '보류' },
];

const PAGE_SIZE = 10;

// ISO(LocalDateTime) → 'yy.mm.dd' 표시용
function formatYYMMDD(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}`;
}

// 백엔드 목록 항목 → 표 행 형태로 변환
function mapRow(q) {
  return {
    id: q.questionId,
    title: q.title,
    author: q.writerName ?? '-',
    dept: q.departmentName ?? '-',
    category: q.categoryName,
    status: q.status,
    createdAt: formatYYMMDD(q.createdAt),
  };
}

// 'yy.mm.dd' → 연/월/일 분해 (날짜 필터 비교용)
function parseCreatedAt(createdAt) {
  const [yy, mm, dd] = createdAt.split('.');
  return { year: `20${yy}`, month: mm, day: dd };
}

function StatusBadge({ status }) {
  return (
    <span className={`${styles.statusBadge} ${styles[QNA_STATUS_CLASS[status]] ?? ''}`}>
      {QNA_STATUS_LABEL[status] ?? status}
    </span>
  );
}

function StatCard({ label, count, color, sub, iconText }) {
  return (
    <div className={styles.statCard}>
      <div className={`${styles.statIcon} ${styles[color] ?? ''}`}>{iconText}</div>
      <div className={styles.statBody}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statValue}>{count}건</span>
        <span className={styles.statSub}>{sub}</span>
      </div>
    </div>
  );
}

function AdminQnaPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  // 입력 중(draft) 필터 값 — '검색' 버튼을 눌러야 실제 필터에 반영된다
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(''); // yyyy-mm-dd (달력 선택값)
  // 실제 적용된 필터 — '검색' 클릭 시점의 스냅샷
  const [applied, setApplied] = useState({ search: '', status: '', category: '', date: '' });
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState(null);

  // 관리자 질문 목록 실데이터 조회 (refreshKey 증가 시 재조회)
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    getAdminQnas({ size: 1000 })
      .then(res => {
        if (ignore) return;
        setRows((res?.data?.content ?? []).map(mapRow));
      })
      .catch(() => {
        if (!ignore) setRows([]);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  const counts = useMemo(() => {
    const c = { RECEIVED: 0, IN_PROGRESS: 0, ANSWERED: 0, ON_HOLD: 0 };
    rows.forEach(r => {
      if (c[r.status] !== undefined) c[r.status]++;
    });
    return c;
  }, [rows]);

  const categories = useMemo(() => [...new Set(rows.map(r => r.category))], [rows]);

  const filtered = useMemo(() => {
    return rows.filter(row => {
      const { year, month, day } = parseCreatedAt(row.createdAt);
      const rowDate = `${year}-${month}-${day}`;
      const matchSearch =
        !applied.search ||
        row.title.includes(applied.search) ||
        (row.author ?? '').includes(applied.search);
      const matchStatus = !applied.status || row.status === applied.status;
      const matchCategory = !applied.category || row.category === applied.category;
      const matchDate = !applied.date || rowDate === applied.date;
      return matchSearch && matchStatus && matchCategory && matchDate;
    });
  }, [rows, applied]);

  // '검색' 클릭(또는 검색창 Enter) 시에만 필터 적용
  const runSearch = () => {
    setApplied({
      search,
      status: statusFilter,
      category: categoryFilter,
      date: dateFilter,
    });
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const allChecked = paged.length > 0 && paged.every(r => selectedIds.includes(r.id));

  const toggleAll = () => {
    if (allChecked) {
      setSelectedIds(ids => ids.filter(id => !paged.some(r => r.id === id)));
    } else {
      setSelectedIds(ids => [...new Set([...ids, ...paged.map(r => r.id)])]);
    }
  };

  const toggleRow = id => {
    setSelectedIds(ids => (ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]));
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) return;
    setRows(rs => rs.filter(r => !selectedIds.includes(r.id)));
    setSelectedIds([]);
  };

  if (detailId != null) {
    return (
      <AdminQnaDetail
        questionId={detailId}
        onBack={() => {
          setDetailId(null);
          setRefreshKey(k => k + 1);
        }}
      />
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.titleBlock}>
          <h1 className={styles.pageTitle}>답변 관리</h1>
          <p className={styles.pageSubtitle}>신입사원의 질문을 확인하고 답변을 등록·관리하세요.</p>
        </div>
      </header>

      <div className={styles.statsGrid}>
        {STAT_CARDS.map(card => (
          <StatCard
            key={card.key}
            label={card.label}
            count={counts[card.key]}
            color={card.color}
            sub={card.sub}
            iconText={card.iconText}
          />
        ))}
      </div>

      <div className={styles.tableCard}>
        <div className={styles.filters}>
          <div className={styles.searchWrap}>
            <input
              type="text"
              className={styles.filterSearch}
              placeholder="제목, 작성자 검색"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runSearch()}
            />
          </div>
          <Dropdown
            className={styles.filterSelect}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: '', label: '전체 상태' },
              ...STAT_CARDS.map(s => ({ value: s.key, label: s.label })),
            ]}
          />
          <Dropdown
            className={styles.filterSelect}
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { value: '', label: '전체 카테고리' },
              ...categories.map(c => ({ value: c, label: c })),
            ]}
          />
          <input
            type="date"
            className={styles.filterDate}
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          />
          <div className={styles.filterSpacer} />
          <button
            className={styles.btnDelete}
            onClick={handleDelete}
            disabled={selectedIds.length === 0}
          >
            삭제
          </button>
          <button className={styles.btnSearch} onClick={runSearch}>
            검색
          </button>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.checkCol}>
                <input type="checkbox" checked={allChecked} onChange={toggleAll} />
              </th>
              <th>제목</th>
              <th>작성자</th>
              <th>부서</th>
              <th>카테고리</th>
              <th>상태</th>
              <th>등록일</th>
            </tr>
          </thead>
          <tbody>
            {(loading || paged.length === 0) && (
              <tr>
                <td colSpan={7} className={styles.emptyCell}>
                  {loading ? '불러오는 중…' : '질문이 없습니다.'}
                </td>
              </tr>
            )}
            {!loading &&
              paged.map(row => (
                <tr key={row.id} className={styles.tableRow} onClick={() => setDetailId(row.id)}>
                  <td className={styles.checkCol} onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => toggleRow(row.id)}
                    />
                  </td>
                  <td>
                    <span className={styles.qTitle}>{row.title}</span>
                  </td>
                  <td className={styles.textCell}>{row.author}</td>
                  <td className={styles.textCell}>{row.dept}</td>
                  <td>
                    <Badge
                      colorKey={DEPT_COLOR[row.category] ?? COLOR_KEYS.PURPLE}
                      size={BADGE_SIZES.SM}
                    >
                      {row.category}
                    </Badge>
                  </td>
                  <td>
                    <StatusBadge status={row.status} />
                  </td>
                  <td className={styles.textCell}>{row.createdAt}</td>
                </tr>
              ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageArrow}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ‹
            </button>
            {slidingPageWindow(page, totalPages).map((n, i) =>
              n === '…' ? (
                <span key={`e${i}`} className={styles.pageNum} style={{ pointerEvents: 'none' }}>
                  …
                </span>
              ) : (
                <button
                  key={n}
                  className={`${styles.pageNum} ${n === page ? styles.pageNumActive : ''}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              )
            )}
            <button
              className={styles.pageArrow}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminQnaPage;
