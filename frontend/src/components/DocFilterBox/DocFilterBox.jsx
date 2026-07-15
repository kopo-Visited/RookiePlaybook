import { useState, useRef, useEffect, useMemo } from 'react';
import styles from './DocFilterBox.module.css';

/*
 * DocListPage.jsx의 필터 박스(검색어 + 카테고리 + 정렬 + 카운트 카드) 전체를
 * 그대로 떼어낸 독립 컴포넌트. QNA 목록에서도 그대로 재사용한다.
 * - docs: [{ categoryName, ... }] 형태의 배열 (카운트/카테고리 옵션 계산용)
 * - onChange: { search, category, sort } 변경 시 부모에 알림 (선택)
 * - placeholder: 검색어 입력칸 placeholder (선택)
 */

const SORT_OPTIONS = ['최신순', '오래된순', '조회순'];

// 원본 constants/styles.js의 COLOR_KEYS와 동일
const COLOR_KEYS = {
  BLUE: 'blue',
  GREEN: 'green',
  PINK: 'pink',
  ORANGE: 'orange',
  PURPLE: 'purple',
};

const CATEGORY_COLOR_MAP = {
  개발: COLOR_KEYS.BLUE,
  인프라: COLOR_KEYS.GREEN,
  보안: COLOR_KEYS.PINK,
  네트워크: COLOR_KEYS.ORANGE,
  공통: COLOR_KEYS.PURPLE,
};
const CATEGORY_ICON = { 개발: 'Dev', 인프라: 'Infra', 보안: 'Sec', 네트워크: 'Net', 공통: 'All' };

// 지식문서와 동일한 카테고리 고정 순서(All·Sec·Infra·Dev·Net). 없는 카테고리도 0건으로 항상 노출.
const CATEGORY_ORDER = ['공통', '보안', '인프라', '개발', '네트워크'];

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

// 바깥 클릭 시 닫히는 드롭다운 훅
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

export default function DocFilterBox({ docs = [], onChange, placeholder = '검색어를 입력하세요' }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('전체');
  const [sort, setSort] = useState('최신순');

  const categoryDD = useDropdown();
  const sortDD = useDropdown();

  // 카테고리별 개수(고정 순서 + 없는 카테고리도 0으로, 순서 밖 카테고리는 뒤에 붙임)
  const orderedCategories = useMemo(() => {
    const countMap = {};
    docs.forEach(d => {
      if (d.categoryName) countMap[d.categoryName] = (countMap[d.categoryName] || 0) + 1;
    });
    const extras = Object.keys(countMap).filter(n => !CATEGORY_ORDER.includes(n));
    return [...CATEGORY_ORDER, ...extras].map(name => ({
      id: name,
      categoryName: name,
      colorKey: CATEGORY_COLOR_MAP[name] ?? COLOR_KEYS.BLUE,
      count: countMap[name] || 0,
    }));
  }, [docs]);

  // 드롭다운 옵션(카운트 카드와 같은 순서)
  const categoryOptions = useMemo(
    () => ['전체', ...orderedCategories.map(c => c.categoryName)],
    [orderedCategories]
  );

  // 카운트 카드
  const summaryCards = orderedCategories;

  // 상태 변경 시 부모에 알림
  useEffect(() => {
    onChange?.({ search, category, sort });
  }, [search, category, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch(value) {
    setSearch(value);
  }
  function handleCategorySelect(option) {
    setCategory(option);
    categoryDD.setOpen(false);
  }
  function handleSortSelect(opt) {
    setSort(opt);
    sortDD.setOpen(false);
  }

  return (
    <section className={styles.filterCard}>
      <div className={styles.filterRow}>
        {/* 검색어 */}
        <div className={`${styles.filterField} ${styles.filterFieldWide}`}>
          <label className={styles.filterLabel}>검색어</label>
          <div className={styles.inputWrap}>
            <input
              className={styles.input}
              placeholder={placeholder}
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
            <span className={styles.inputIcon}>
              <IconSearch />
            </span>
          </div>
        </div>

        {/* 카테고리 */}
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

        {/* 정렬 */}
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

      {/* 카테고리 카운트 카드 */}
      <div className={styles.summaryRow}>
        {summaryCards.map(({ id, categoryName, colorKey, count }) => (
          <div
            key={id}
            className={`${styles.summaryCard} ${category === categoryName ? styles.summaryCardActive : ''}`}
            onClick={() => handleCategorySelect(category === categoryName ? '전체' : categoryName)}
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
  );
}
