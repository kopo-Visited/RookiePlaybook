import { useState, useMemo, useEffect } from 'react';
import styles from './AdminQnaPage.module.css';
import AdminQnaDetail from './AdminQnaDetail';
import { getAdminQnas, updateQnaVisibility, deleteAdminQna } from '../../../api/qnaApi';
import { pageWindow } from '../../../utils/pageWindow';
import { DEPT_COLOR, COLOR_KEYS, BADGE_SIZES } from '../../../constants/styles';
import Badge from '../../../components/Badge/Badge';
import Dropdown from '../../../components/Dropdown/Dropdown';
import useToastStore from '../../../stores/toastStore';

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
    isPublic: q.isPublic ?? true,
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

// 관리 컬럼: 콘텐츠관리와 동일하게 수정 / 삭제 / 비공개
function ActionButtons({ row, onEdit, onDelete, onTogglePublic }) {
  return (
    <div className={styles.actionRow} onClick={e => e.stopPropagation()}>
      <button className={styles.actionBtn} onClick={() => onEdit(row)}>
        수정
      </button>
      <button
        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
        onClick={() => onDelete(row)}
      >
        삭제
      </button>
      <button className={styles.actionBtn} onClick={() => onTogglePublic(row)}>
        {row.isPublic ? '비공개' : '공개'}
      </button>
    </div>
  );
}

function AdminQnaPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  // 필터: 선택 즉시 자동 반영(검색창 없음)
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(''); // yyyy-mm-dd (달력 선택값)
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
      const matchStatus = !statusFilter || row.status === statusFilter;
      const matchCategory = !categoryFilter || row.category === categoryFilter;
      const matchDate = !dateFilter || rowDate === dateFilter;
      return matchStatus && matchCategory && matchDate;
    });
  }, [rows, statusFilter, categoryFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 필터로 페이지 수가 줄면 현재 페이지를 범위 안으로 되돌린다
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleReset = () => {
    setStatusFilter('');
    setCategoryFilter('');
    setDateFilter('');
    setPage(1);
  };

  const handleEdit = row => setDetailId(row.id);
  // 공개/비공개 전환: 백엔드 반영 후 낙관적 업데이트, 실패 시 롤백
  const handleTogglePublic = async row => {
    const next = !row.isPublic;
    setRows(rs => rs.map(r => (r.id === row.id ? { ...r, isPublic: next } : r)));
    try {
      await updateQnaVisibility(row.id, next);
    } catch {
      setRows(rs => rs.map(r => (r.id === row.id ? { ...r, isPublic: row.isPublic } : r)));
      useToastStore.getState().show('공개 상태 변경에 실패했습니다.');
    }
  };
  // 삭제: 콘텐츠 관리와 동일하게 확인 후 백엔드 삭제(논리) → 목록에서 제거
  const handleDelete = async row => {
    if (!window.confirm(`"${row.title}" 질문을 삭제하시겠습니까?`)) return;
    try {
      await deleteAdminQna(row.id);
      setRows(rs => rs.filter(r => r.id !== row.id));
    } catch {
      useToastStore.getState().show('질문 삭제에 실패했습니다.');
    }
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
          <Dropdown
            className={styles.filterSelect}
            value={statusFilter}
            onChange={v => {
              setStatusFilter(v);
              setPage(1);
            }}
            options={[
              { value: '', label: '전체 상태' },
              ...STAT_CARDS.map(s => ({ value: s.key, label: s.label })),
            ]}
          />
          <Dropdown
            className={styles.filterSelect}
            value={categoryFilter}
            onChange={v => {
              setCategoryFilter(v);
              setPage(1);
            }}
            options={[
              { value: '', label: '전체 카테고리' },
              ...categories.map(c => ({ value: c, label: c })),
            ]}
          />
          <input
            type="date"
            className={styles.filterDate}
            value={dateFilter}
            onChange={e => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
          />
          <button className={styles.resetBtn} onClick={handleReset}>
            초기화
          </button>
        </div>

        <table className={styles.table}>
          <colgroup>
            <col />
            <col className={styles.colAuthor} />
            <col className={styles.colDept} />
            <col className={styles.colCategory} />
            <col className={styles.colStatus} />
            <col className={styles.colDate} />
            <col className={styles.colActions} />
          </colgroup>
          <thead>
            <tr>
              <th>제목</th>
              <th>작성자</th>
              <th>부서</th>
              <th>카테고리</th>
              <th>상태</th>
              <th>등록일</th>
              <th>관리</th>
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
                  <td>
                    <ActionButtons
                      row={row}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onTogglePublic={handleTogglePublic}
                    />
                  </td>
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
            {pageWindow(page, totalPages).map((n, i) =>
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
