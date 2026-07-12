import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DocListPage.module.css';
import Badge from '../../../components/Badge/Badge';
import DocDetailModal from '../../../components/DocDetailModal/DocDetailModal';
import Toast from '../../../components/Toast/Toast';
import { COLOR_KEYS, BADGE_SIZES } from '../../../constants/styles';
import { ROUTES } from '../../../constants/routes';
import { getDocuments } from '../../../api/docApi';
import useFetch from '../../../hooks/useFetch';

const SORT_OPTIONS = ['최신순', '오래된순', '조회순'];
const PAGE_SIZE = 10;

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

const faqItems = [
  {
    id: 1,
    colorKey: COLOR_KEYS.BLUE,
    question: 'Git 충돌이 나면 어떻게 하나요?',
    tags: '개발 · Git · PR',
  },
  {
    id: 2,
    colorKey: COLOR_KEYS.GREEN,
    question: '서버 접속 권한은 어디서 요청하나요?',
    tags: '인프라 · 권한',
  },
  {
    id: 3,
    colorKey: COLOR_KEYS.PINK,
    question: '개인정보 파일은 어떻게 공유하나요?',
    tags: '보안 · 개인정보',
  },
  {
    id: 4,
    colorKey: COLOR_KEYS.ORANGE,
    question: 'VPN이 안 될 때 무엇을 확인하나요?',
    tags: '네트워크 · VPN',
  },
];

const CATEGORY_COLOR_MAP = {
  개발: COLOR_KEYS.BLUE,
  인프라: COLOR_KEYS.GREEN,
  보안: COLOR_KEYS.PINK,
  네트워크: COLOR_KEYS.ORANGE,
  공통: COLOR_KEYS.PURPLE,
};
const CATEGORY_ICON = { 개발: 'Dev', 인프라: 'Infra', 보안: 'Sec', 네트워크: 'Net', 공통: 'All' };

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

function IconHeart() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        stroke="currentColor"
        strokeWidth="2"
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

function DocListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('전체');
  const [sort, setSort] = useState('최신순');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [page, setPage] = useState(1);
  const [bookmarks, setBookmarks] = useState([]);
  const [toast, setToast] = useState(null);
  const [bookmarkView, setBookmarkView] = useState(false);

  const { data: apiRes, loading, error } = useFetch(() => getDocuments(), []);
  const docs = apiRes?.data ?? [];

  const categoryDD = useDropdown();
  const sortDD = useDropdown();

  const categoryOptions = useMemo(() => {
    const names = [...new Set(docs.map(d => d.categoryName))];
    return ['전체', ...names];
  }, [docs]);

  const displayedDocs = useMemo(() => {
    let list = docs;
    if (bookmarkView) {
      const ids = new Set(bookmarks.map(b => b.id));
      list = list.filter(d => ids.has(d.id));
    } else {
      if (search.trim()) list = list.filter(d => d.title.includes(search.trim()));
      if (category !== '전체') list = list.filter(d => d.categoryName === category);
    }
    if (sort === '오래된순')
      list = [...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sort === '조회순') list = [...list].sort((a, b) => b.viewCount - a.viewCount);
    else list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }, [docs, search, category, sort, bookmarkView, bookmarks]);

  const summaryCards = useMemo(() => {
    const countMap = {};
    docs.forEach(d => {
      countMap[d.categoryName] = (countMap[d.categoryName] || 0) + 1;
    });
    return Object.entries(countMap).map(([name, count]) => ({
      id: name,
      categoryName: name,
      colorKey: CATEGORY_COLOR_MAP[name] ?? COLOR_KEYS.BLUE,
      count,
    }));
  }, [docs]);

  const categoryColorMap = useMemo(
    () => Object.fromEntries(summaryCards.map(c => [c.categoryName, c.colorKey])),
    [summaryCards]
  );

  const totalPages = Math.max(1, Math.ceil(displayedDocs.length / PAGE_SIZE));
  const pagedDocs = displayedDocs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleCategorySelect(option) {
    setCategory(option);
    setPage(1);
    setBookmarkView(false);
    categoryDD.setOpen(false);
  }

  function handleSortSelect(opt) {
    setSort(opt);
    setPage(1);
    sortDD.setOpen(false);
  }

  function handleSearch(value) {
    setSearch(value);
    setPage(1);
  }

  function handleBookmarkViewToggle() {
    setBookmarkView(v => !v);
    setPage(1);
  }

  const showToast = useCallback(msg => {
    setToast(msg);
  }, []);

  const handleBookmark = useCallback(
    doc => {
      const already = bookmarks.some(b => b.id === doc.id);
      if (already) {
        setBookmarks(prev => prev.filter(b => b.id !== doc.id));
        showToast('북마크에서 제거되었습니다.');
      } else {
        const colorKey = categoryColorMap[doc.categoryName] ?? COLOR_KEYS.BLUE;
        const date = doc.createdAt
          ? new Date(doc.createdAt)
              .toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
              .replace(/\. /g, '.')
              .replace('.', '')
          : '';
        setBookmarks(prev => [
          { id: doc.id, colorKey, title: doc.title, meta: `${doc.categoryName} · ${date}` },
          ...prev,
        ]);
        showToast('북마크에 저장되었습니다.');
      }
    },
    [bookmarks, categoryColorMap, showToast]
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>부서별 지식문서 / FAQ</h1>
        <p className={styles.pageSubtitle}>
          개발 · 인프라 · 보안 · 네트워크 신입이 오늘 바로 따라 할 수 있는 문서와 FAQ를 모았어요.
        </p>
      </div>

      <section className={styles.filterCard}>
        <div className={styles.filterRow}>
          <div className={`${styles.filterField} ${styles.filterFieldWide}`}>
            <label className={styles.filterLabel}>검색어</label>
            <div className={styles.inputWrap}>
              <input
                className={styles.input}
                placeholder="검색어를 입력하세요"
                value={search}
                onChange={e => handleSearch(e.target.value)}
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
                    onClick={() => handleCategorySelect(opt)}
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
          {summaryCards.map(({ id, categoryName, colorKey, count }) => (
            <div
              key={id}
              className={`${styles.summaryCard} ${category === categoryName ? styles.summaryCardActive : ''}`}
              onClick={() =>
                handleCategorySelect(category === categoryName ? '전체' : categoryName)
              }
            >
              <div className={`${styles.summaryIcon} ${styles[colorKey]}`}>
                {CATEGORY_ICON[categoryName] ?? categoryName}
              </div>
              <div className={styles.summaryText}>
                <span className={styles.summaryCount}>{count}</span>
                <span className={styles.summaryLabel}>{categoryName}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.contentGrid}>
        <section className={styles.docSection}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionHeadLeft}>
              <span className={styles.sectionTitle}>
                {bookmarkView ? '내 북마크' : '카테고리별 핵심 문서'}
              </span>
              <Badge colorKey={COLOR_KEYS.BLUE}>총 {displayedDocs.length}건</Badge>
            </div>
            {bookmarkView && (
              <button className={styles.linkBtn} onClick={handleBookmarkViewToggle}>
                ← 전체 문서
              </button>
            )}
          </div>

          {loading && <p className={styles.empty}>문서를 불러오는 중...</p>}
          {error && <p className={styles.empty}>문서를 불러오지 못했습니다.</p>}
          {!loading && !error && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>문서명</th>
                  <th>카테고리</th>
                  <th>내용</th>
                  <th>조회수</th>
                  <th>등록일</th>
                </tr>
              </thead>
              <tbody>
                {pagedDocs.map(doc => (
                  <tr key={doc.id} className={styles.tableRow} onClick={() => setSelectedDoc(doc)}>
                    <td>
                      <div className={styles.titleCell}>
                        <span className={styles.titleText}>{doc.title}</span>
                      </div>
                    </td>
                    <td>
                      <Badge
                        colorKey={categoryColorMap[doc.categoryName] ?? COLOR_KEYS.BLUE}
                        size={BADGE_SIZES.SM}
                      >
                        {doc.categoryName}
                      </Badge>
                    </td>
                    <td>
                      <span className={styles.secondary}>
                        {doc.content?.slice(0, 40)}
                        {doc.content?.length > 40 ? '...' : ''}
                      </span>
                    </td>
                    <td>
                      <span className={styles.secondary}>{doc.viewCount}</span>
                    </td>
                    <td>
                      <span className={styles.secondary}>{formatDate(doc.createdAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && !error && displayedDocs.length === 0 && (
            <p className={styles.empty}>
              {bookmarkView ? '저장된 북마크가 없습니다.' : '조건에 맞는 문서가 없습니다.'}
            </p>
          )}

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageArrow}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  className={`${styles.pageNum} ${page === n ? styles.pageNumActive : ''}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              <button
                className={styles.pageArrow}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                ›
              </button>
            </div>
          )}
        </section>

        <aside className={styles.sideStack}>
          <section className={styles.sideCard}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionTitle}>최근 FAQ</span>
              <button className={styles.linkBtn} onClick={() => navigate(ROUTES.QNA.ALL)}>
                전체보기 ›
              </button>
            </div>
            <ul className={styles.faqList}>
              {faqItems.map(({ id, colorKey, question, tags }) => (
                <li key={id} className={styles.faqItem}>
                  <div className={`${styles.faqQ} ${styles[colorKey]}`}>Q</div>
                  <div className={styles.faqBody}>
                    <span className={styles.faqQuestion}>{question}</span>
                    <span className={styles.faqTags}>{tags}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className={`${styles.sideCard} ${styles.sideCardBookmark}`}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionTitle}>내 북마크</span>
              {bookmarks.length > 0 && (
                <button className={styles.linkBtn} onClick={handleBookmarkViewToggle}>
                  {bookmarkView ? '← 전체' : '전체보기 ›'}
                </button>
              )}
            </div>
            <ul className={styles.bookmarkList}>
              {bookmarks.length === 0 && (
                <li className={styles.bookmarkEmpty}>저장된 북마크가 없습니다.</li>
              )}
              {bookmarks.slice(0, 3).map(({ id, colorKey, title, meta }) => (
                <li key={id} className={styles.bookmarkItem}>
                  <div className={`${styles.bookmarkIcon} ${styles[colorKey]}`}>
                    <IconHeart />
                  </div>
                  <div className={styles.bookmarkBody}>
                    <span className={styles.bookmarkTitle}>{title}</span>
                    <span className={styles.bookmarkMeta}>{meta}</span>
                  </div>
                </li>
              ))}
              {bookmarks.length > 3 && (
                <li className={styles.bookmarkMore} onClick={handleBookmarkViewToggle}>
                  +{bookmarks.length - 3}개 더보기
                </li>
              )}
            </ul>
          </section>
        </aside>
      </div>

      {selectedDoc && (
        <DocDetailModal
          doc={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onBookmark={handleBookmark}
          isBookmarked={bookmarks.some(b => b.id === selectedDoc.id)}
        />
      )}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

export default DocListPage;
