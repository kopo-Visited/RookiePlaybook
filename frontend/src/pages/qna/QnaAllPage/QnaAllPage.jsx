import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../QnaListPage/QnaListPage.module.css';
import { getAllQnas } from '../../../api/qnaApi';
import { ROUTES } from '../../../constants/routes';
import { DEPT_COLOR, COLOR_KEYS, BADGE_SIZES } from '../../../constants/styles';
import Badge from '../../../components/Badge/Badge';
import Spinner from '../../../components/Spinner/Spinner';
import ErrorMessage from '../../../components/ErrorMessage/ErrorMessage';
import EmptyState from '../../../components/EmptyState/EmptyState';
import QnaDetailModal from '../../../components/QnaDetailModal/QnaDetailModal';
import QnaQuestionModal from '../../../components/QnaQuestionModal/QnaQuestionModal';
import { pageWindow } from '../../../utils/pageWindow';
import { displayWriter } from '../../../utils/maskName';
import useAuthStore from '../../../stores/authStore';

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

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}`;
}

function StatusBadge({ status }) {
  const s = QNA_STATUS_STYLE[status] || { color: '#172033', background: '#F4F6F9' };
  return (
    <span className={styles.statusBadge} style={{ color: s.color, background: s.background }}>
      {QNA_STATUS_LABEL[status] || status}
    </span>
  );
}

function QnaAllPage() {
  const navigate = useNavigate();
  const myId = useAuthStore(s => s.user?.userId);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState(null);
  const [category, setCategory] = useState('전체 카테고리');
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    getAllQnas({ size: 1000 })
      .then(res => {
        if (!ignore) setRows(res?.data?.content ?? []);
      })
      .catch(() => {
        if (!ignore) setError(true);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  const categoryCards = useMemo(() => {
    const counts = {};
    rows.forEach(r => {
      if (r.categoryName) counts[r.categoryName] = (counts[r.categoryName] || 0) + 1;
    });
    return [
      { name: '전체 카테고리', label: '전체', count: rows.length },
      ...Object.keys(counts).map(c => ({ name: c, label: c, count: counts[c] })),
    ];
  }, [rows]);

  const filtered = useMemo(() => {
    let list = rows;
    if (category !== '전체 카테고리') list = list.filter(r => r.categoryName === category);
    const kw = search.trim();
    if (kw) list = list.filter(r => (r.title ?? '').includes(kw));
    return list;
  }, [rows, category, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function handleCategorySelect(opt) {
    setCategory(opt);
    setPage(1);
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerText}>
          <h1 className={styles.pageTitle}>모든 질문</h1>
          <p className={styles.pageSubtitle}>모든 구성원이 남긴 질문과 답변을 확인할 수 있어요.</p>
        </div>
        <div className={styles.actionBtns}>
          <button className={styles.btnAllQna} onClick={() => navigate(ROUTES.QNA.LIST)}>
            내 질문 확인하기
          </button>
          <button className={styles.btnAsk} onClick={() => setModalOpen(true)}>
            + 질문하기
          </button>
        </div>
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
                <th>작성자</th>
                <th>등록일</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(item => (
                <tr
                  key={item.questionId}
                  className={styles.tableRow}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setDetailId(item.questionId)}
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
                    <span className={styles.secondary}>
                      {displayWriter(item.writerName, item.writerId, myId)}
                    </span>
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
            >
              ›
            </button>
          </div>
        )}
      </section>

      {detailId != null && (
        <QnaDetailModal questionId={detailId} publicView onClose={() => setDetailId(null)} />
      )}

      {modalOpen && (
        <QnaQuestionModal
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setRefreshKey(k => k + 1);
            setCategory('전체 카테고리');
            setPage(1);
          }}
        />
      )}
    </div>
  );
}

export default QnaAllPage;
