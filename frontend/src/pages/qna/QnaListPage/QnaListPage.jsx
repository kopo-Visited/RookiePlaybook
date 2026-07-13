import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './QnaListPage.module.css';
import { ROUTES } from '../../../constants/routes';
import { DEPT_COLOR, COLOR_KEYS, BADGE_SIZES } from '../../../constants/styles';
import Badge from '../../../components/Badge/Badge';
import useFetch from '../../../hooks/useFetch';
import { getQnas } from '../../../api/qnaApi';
import Spinner from '../../../components/Spinner/Spinner';
import ErrorMessage from '../../../components/ErrorMessage/ErrorMessage';
import EmptyState from '../../../components/EmptyState/EmptyState';
import QnaQuestionModal from '../../../components/QnaQuestionModal/QnaQuestionModal';
import QnaDetailModal from '../../../components/QnaDetailModal/QnaDetailModal';

const PAGE_SIZE = 10;

const QNA_STATUS_LABEL = {
  RECEIVED: '접수',
  IN_PROGRESS: '처리중',
  ANSWERED: '답변완료',
  ON_HOLD: '보류',
};

const QNA_STATUS_STYLE = {
  RECEIVED: { color: '#FF4D94', background: '#FFF0F6' },
  IN_PROGRESS: { color: '#2288FF', background: '#EAF4FF' },
  ANSWERED: { color: '#12B886', background: '#E6F8F2' },
  ON_HOLD: { color: '#FFAD33', background: '#FFF5E6' },
};

const ALL_STATUSES = [
  { key: null, label: '전체' },
  { key: 'RECEIVED', label: '접수' },
  { key: 'IN_PROGRESS', label: '처리중' },
  { key: 'ANSWERED', label: '답변완료' },
  { key: 'ON_HOLD', label: '보류' },
];

// 카테고리 요약 카드 아이콘 색상(순환)
const SUM_COLORS = ['sumBlue', 'sumGreen', 'sumOrange', 'sumPink', 'sumPurple'];

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}`;
}

function StatusChip({ statusKey, label, count, active, onClick }) {
  const s = QNA_STATUS_STYLE[statusKey] || { color: '#172033', background: '#FFFFFF' };
  return (
    <button
      className={`${styles.chip} ${active ? styles.chipActive : ''}`}
      style={active ? { background: s.background, color: s.color, borderColor: s.background } : {}}
      onClick={onClick}
      aria-pressed={active}
    >
      {label} {count}
    </button>
  );
}

function StatusBadge({ status }) {
  const s = QNA_STATUS_STYLE[status] || { color: '#172033', background: '#F4F6F9' };
  const label = QNA_STATUS_LABEL[status] || status;
  return (
    <span className={styles.statusBadge} style={{ color: s.color, background: s.background }}>
      {label}
    </span>
  );
}

function QnaListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStatus, setActiveStatus] = useState(null);
  const [category, setCategory] = useState('전체 카테고리');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [detailId, setDetailId] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [search, setSearch] = useState('');

  // 알림에서 넘어온 경우(state.openQuestionId) 해당 질문 상세 모달을 자동으로 연다
  useEffect(() => {
    if (location.state?.openQuestionId != null) {
      setDetailId(location.state.openQuestionId);
      // 뒤로가기/새로고침 시 다시 열리지 않도록 state 정리
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  const { data, loading, error } = useFetch(
    () => getQnas({ size: 100 }).then(r => r.data ?? r),
    [refreshKey]
  );

  const items = useMemo(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : (data.content ?? data.data ?? []);
  }, [data]);

  const categoryCards = useMemo(() => {
    const counts = {};
    items.forEach(i => {
      if (i.categoryName) counts[i.categoryName] = (counts[i.categoryName] || 0) + 1;
    });
    return [
      { name: '전체 카테고리', label: '전체', count: items.length },
      ...Object.keys(counts).map(c => ({ name: c, label: c, count: counts[c] })),
    ];
  }, [items]);

  const statusCounts = useMemo(() => {
    const counts = {};
    ALL_STATUSES.forEach(({ key }) => {
      counts[key] = 0;
    });
    items.forEach(i => {
      if (counts[i.status] !== undefined) counts[i.status]++;
    });
    counts[null] = items.length;
    return counts;
  }, [items]);

  const filtered = useMemo(() => {
    let list = items;
    if (activeStatus) list = list.filter(i => i.status === activeStatus);
    if (category !== '전체 카테고리') list = list.filter(i => i.categoryName === category);
    const kw = search.trim();
    if (kw) list = list.filter(i => (i.title ?? '').includes(kw));
    return list;
  }, [items, activeStatus, category, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 삭제/필터로 페이지 수가 줄면 현재 페이지를 범위 안으로 되돌린다
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function handleStatusClick(key) {
    setActiveStatus(key);
    setPage(1);
  }

  function handleCategorySelect(opt) {
    setCategory(opt);
    setPage(1);
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerText}>
          <h1 className={styles.pageTitle}>질문·답변</h1>
          <p className={styles.pageSubtitle}>내 질문 및 답변을 확인할 수 있어요.</p>
        </div>
        <div className={styles.actionBtns}>
          <button className={styles.btnAllQna} onClick={() => navigate(ROUTES.QNA.ALL)}>
            모든 QNA 확인하기
          </button>
          <button className={styles.btnAsk} onClick={() => setModalOpen(true)}>
            + 질문하기
          </button>
        </div>
      </div>

      {/* 상태 필터 칩 */}
      <div className={styles.chipRow}>
        <button
          className={`${styles.chip} ${activeStatus === null ? styles.chipActiveAll : ''}`}
          onClick={() => handleStatusClick(null)}
          aria-pressed={activeStatus === null}
        >
          전체 {statusCounts[null]}
        </button>
        {ALL_STATUSES.filter(s => s.key !== null).map(({ key, label }) => (
          <StatusChip
            key={key}
            statusKey={key}
            label={label}
            count={statusCounts[key]}
            active={activeStatus === key}
            onClick={() => handleStatusClick(key)}
          />
        ))}
      </div>

      {/* 카테고리 요약 카드 (지식문서식 클릭 필터) */}
      <div className={styles.summaryRow}>
        {categoryCards.map((c, idx) => (
          <div
            key={c.name}
            className={`${styles.summaryCard} ${category === c.name ? styles.summaryCardActive : ''}`}
            onClick={() => handleCategorySelect(category === c.name ? '전체 카테고리' : c.name)}
          >
            <div className={`${styles.summaryIcon} ${styles[SUM_COLORS[idx % SUM_COLORS.length]]}`}>
              {c.label.slice(0, 1)}
            </div>
            <div className={styles.summaryText}>
              <span className={styles.summaryCount}>{c.count}</span>
              <span className={styles.summaryLabel}>{c.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 검색 (지식문서식 자동 필터) */}
      <div className={styles.filterRow}>
        <div className={styles.searchWrap}>
          <input
            className={styles.searchInput}
            placeholder="제목 검색"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* 테이블 */}
      <section className={styles.tableCard}>
        {loading && <Spinner />}
        {!loading && error && <ErrorMessage />}
        {!loading && !error && paged.length === 0 && (
          <EmptyState message="등록된 질문이 없습니다." />
        )}
        {!loading && !error && paged.length > 0 && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>상태</th>
                <th>카테고리</th>
                <th>제목</th>
                <th>등록일</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(item => (
                <tr
                  key={item.questionId}
                  className={styles.tableRow}
                  onClick={() => setDetailId(item.questionId)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td>
                    <Badge
                      colorKey={DEPT_COLOR[item.categoryName] ?? COLOR_KEYS.PURPLE}
                      size={BADGE_SIZES.SM}
                    >
                      {item.categoryName}
                    </Badge>
                  </td>
                  <td>
                    <span className={styles.titleText}>{item.title}</span>
                  </td>
                  <td>
                    <span className={styles.secondary}>{formatDate(item.createdAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && !error && totalPages > 1 && (
          <div className={styles.pagination}>
            <button className={styles.pageArrow} onClick={() => setPage(p => Math.max(1, p - 1))}>
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                className={`${styles.pageNum} ${n === page ? styles.pageNumActive : ''}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              className={styles.pageArrow}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              ›
            </button>
          </div>
        )}
      </section>

      {modalOpen && (
        <QnaQuestionModal
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setRefreshKey(k => k + 1);
            setActiveStatus(null);
            setPage(1);
          }}
        />
      )}

      {detailId != null && (
        <QnaDetailModal
          questionId={detailId}
          onClose={() => setDetailId(null)}
          onChanged={() => setRefreshKey(k => k + 1)}
          onEdit={detail => {
            setDetailId(null);
            setEditTarget(detail);
          }}
        />
      )}

      {editTarget && (
        <QnaQuestionModal
          mode="edit"
          questionId={editTarget.questionId}
          initial={{
            title: editTarget.title,
            content: editTarget.content,
            categoryName: editTarget.categoryName,
          }}
          onClose={() => setEditTarget(null)}
          onSuccess={() => setRefreshKey(k => k + 1)}
        />
      )}
    </div>
  );
}

export default QnaListPage;
