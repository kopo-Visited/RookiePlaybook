import { useState, useRef, useEffect, useMemo } from 'react';
import styles from './QnaListPage.module.css';
import useFetch from '../../../hooks/useFetch';
import { getQnas } from '../../../api/qnaApi';
import Spinner from '../../../components/Spinner/Spinner';
import ErrorMessage from '../../../components/ErrorMessage/ErrorMessage';
import EmptyState from '../../../components/EmptyState/EmptyState';
import QnaQuestionModal from '../../../components/QnaQuestionModal/QnaQuestionModal';

const PAGE_SIZE = 10;

const QNA_STATUS_LABEL = {
  RECEIVED: '접수',
  IN_PROGRESS: '처리중',
  ANSWERED: '답변완료',
  ON_HOLD: '보류',
};

const QNA_STATUS_STYLE = {
  RECEIVED:    { color: '#FF4D94', background: '#FFF0F6' },
  IN_PROGRESS: { color: '#2288FF', background: '#EAF4FF' },
  ANSWERED:    { color: '#12B886', background: '#E6F8F2' },
  ON_HOLD:     { color: '#FFAD33', background: '#FFF5E6' },
};

const ALL_STATUSES = [
  { key: null,          label: '전체' },
  { key: 'RECEIVED',    label: '접수' },
  { key: 'IN_PROGRESS', label: '처리중' },
  { key: 'ANSWERED',    label: '답변완료' },
  { key: 'ON_HOLD',     label: '보류' },
];

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
  const [activeStatus, setActiveStatus] = useState(null);
  const [category, setCategory] = useState('전체 카테고리');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const categoryDD = useDropdown();

  const { data, loading, error } = useFetch(() => getQnas().then(r => r.data ?? r), []);

  const items = useMemo(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : (data.content ?? data.data ?? []);
  }, [data]);

  const categories = useMemo(() => {
    const set = new Set(items.map(i => i.categoryName).filter(Boolean));
    return ['전체 카테고리', ...set];
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
    return list;
  }, [items, activeStatus, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleStatusClick(key) {
    setActiveStatus(key);
    setPage(1);
  }

  function handleCategorySelect(opt) {
    setCategory(opt);
    categoryDD.setOpen(false);
    setPage(1);
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>질문·답변</h1>
        <p className={styles.pageSubtitle}>내 질문 및 답변을 확인할 수 있어요.</p>
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

      {/* 액션 바 */}
      <div className={styles.actionBar}>
        <div className={styles.categoryDDWrap} ref={categoryDD.ref}>
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
              {categories.map(opt => (
                <li
                  key={opt}
                  className={`${styles.dropdownItem} ${opt === category ? styles.dropdownItemActive : ''}`}
                  onClick={() => handleCategorySelect(opt)}
                >
                  {opt}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button className={styles.btnAsk} onClick={() => setModalOpen(true)}>
          + 질문하기
        </button>
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
                /* TODO: QnaDetailModal 구현 후 onClick으로 상세 열기 */
                <tr key={item.questionId} className={styles.tableRow}>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td>
                    <span className={styles.secondary}>{item.categoryName}</span>
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

      {modalOpen && <QnaQuestionModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}

export default QnaListPage;
