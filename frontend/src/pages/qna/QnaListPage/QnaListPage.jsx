import { useState, useEffect, useMemo, useRef } from 'react';
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

// 카테고리 요약 카드 아이콘 색상(순환)
const SUM_COLORS = ['sumBlue', 'sumGreen', 'sumOrange', 'sumPink', 'sumPurple'];

// 지식문서 필터 박스와 동일한 정렬 옵션
const SORT_OPTIONS = ['최신순', '오래된순', '조회순'];

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}`;
}

// 지식문서 필터 박스에서 쓰는 아이콘/드롭다운 훅 (동일 UI 재사용)
function IconSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return { open, setOpen, ref };
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
  const [category, setCategory] = useState('전체 카테고리');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [detailId, setDetailId] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('최신순');

  const categoryDD = useDropdown();
  const sortDD = useDropdown();

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

  const categoryOptions = useMemo(() => categoryCards.map(c => c.name), [categoryCards]);

  const filtered = useMemo(() => {
    let list = items;
    if (category !== '전체 카테고리') list = list.filter(i => i.categoryName === category);
    const kw = search.trim();
    if (kw) list = list.filter(i => (i.title ?? '').includes(kw));
    if (sort === '오래된순')
      list = [...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sort === '조회순')
      list = [...list].sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
    else list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }, [items, category, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 삭제/필터로 페이지 수가 줄면 현재 페이지를 범위 안으로 되돌린다
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function handleCategorySelect(opt) {
    setCategory(opt);
    setPage(1);
  }

  function handleCategoryDropdown(opt) {
    setCategory(opt);
    setPage(1);
    categoryDD.setOpen(false);
  }

  function handleSortSelect(opt) {
    setSort(opt);
    setPage(1);
    sortDD.setOpen(false);
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

      {/* 필터 박스 (지식문서 필터카드 그대로: 검색어 + 카테고리 + 정렬 + 요약카드) */}
      <section className={styles.filterCard}>
        <div className={styles.filterRow}>
          <div className={`${styles.filterField} ${styles.filterFieldWide}`}>
            <label className={styles.filterLabel}>검색어</label>
            <div className={styles.inputWrap}>
              <input
                className={styles.input}
                placeholder="제목을 입력하세요"
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
              <span className={styles.inputIcon}>
                <IconSearch />
              </span>
            </div>
          </div>

          <div className={styles.filterField} ref={categoryDD.ref}>
            <label className={styles.filterLabel}>카테고리</label>
            <div
              className={`${styles.select} ${categoryDD.open ? styles.selectOpen : ''}`}
              onClick={() => categoryDD.setOpen(o => !o)}
            >
              <span>{category}</span>
              <span
                className={`${styles.selectArrow} ${categoryDD.open ? styles.selectArrowUp : ''}`}
              >
                <IconChevronDown />
              </span>
            </div>
            {categoryDD.open && (
              <ul className={styles.dropdown}>
                {categoryOptions.map(opt => (
                  <li
                    key={opt}
                    className={`${styles.dropdownItem} ${opt === category ? styles.dropdownItemActive : ''}`}
                    onClick={() => handleCategoryDropdown(opt)}
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.filterField} ref={sortDD.ref}>
            <label className={styles.filterLabel}>정렬</label>
            <div
              className={`${styles.select} ${sortDD.open ? styles.selectOpen : ''}`}
              onClick={() => sortDD.setOpen(o => !o)}
            >
              <span>{sort}</span>
              <span className={`${styles.selectArrow} ${sortDD.open ? styles.selectArrowUp : ''}`}>
                <IconChevronDown />
              </span>
            </div>
            {sortDD.open && (
              <ul className={styles.dropdown}>
                {SORT_OPTIONS.map(opt => (
                  <li
                    key={opt}
                    className={`${styles.dropdownItem} ${opt === sort ? styles.dropdownItemActive : ''}`}
                    onClick={() => handleSortSelect(opt)}
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={styles.summaryRow}>
          {categoryCards.map((c, idx) => (
            <div
              key={c.name}
              className={`${styles.summaryCard} ${category === c.name ? styles.summaryCardActive : ''}`}
              onClick={() => handleCategorySelect(category === c.name ? '전체 카테고리' : c.name)}
            >
              <div
                className={`${styles.summaryIcon} ${styles[SUM_COLORS[idx % SUM_COLORS.length]]}`}
              >
                {c.label.slice(0, 1)}
              </div>
              <div className={styles.summaryText}>
                <span className={styles.summaryCount}>{c.count}</span>
                <span className={styles.summaryLabel}>{c.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 테이블 */}
      <section className={styles.tableCard}>
        {loading && <Spinner />}
        {!loading && error && <ErrorMessage />}
        {!loading && !error && paged.length === 0 && (
          <EmptyState message="등록된 질문이 없습니다." />
        )}
        {!loading && !error && paged.length > 0 && (
          <table className={styles.table}>
            <colgroup>
              <col className={styles.colStatus} />
              <col className={styles.colCategory} />
              <col />
              <col className={styles.colDate} />
            </colgroup>
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
