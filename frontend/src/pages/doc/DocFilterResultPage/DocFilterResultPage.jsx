import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './DocFilterResultPage.module.css';
import Badge from '../../../components/Badge/Badge';
import DocDetailModal from '../../../components/DocDetailModal/DocDetailModal';
import QnaQuestionModal from '../../../components/QnaQuestionModal/QnaQuestionModal';
import { COLOR_KEYS, BADGE_SIZES } from '../../../constants/styles';
import { ROUTES } from '../../../constants/routes';
import { getDocuments, getFaqs } from '../../../api/docApi';
import useFetch from '../../../hooks/useFetch';
import Spinner from '../../../components/Spinner/Spinner';

const DEPT_OPTIONS = ['전체 부서', '개발', '인프라', '보안', '네트워크', '공통'];
const SORT_OPTIONS = ['최신순', '오래된순', '조회순'];
const PAGE_SIZE = 10;

const CATEGORY_COLOR_MAP = {
  개발: COLOR_KEYS.BLUE,
  인프라: COLOR_KEYS.GREEN,
  보안: COLOR_KEYS.PINK,
  네트워크: COLOR_KEYS.ORANGE,
  공통: COLOR_KEYS.PURPLE,
};

const CATEGORY_ICON = {
  개발: 'Dev',
  인프라: 'Infra',
  보안: 'Sec',
  네트워크: 'Net',
  공통: 'All',
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

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

function DocFilterResultPage() {
  const { dept: selectedDept } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('최신순');
  const [page, setPage] = useState(1);

  const [deptOpen, setDeptOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [questionOpen, setQuestionOpen] = useState(false);

  const { data: docRes, loading } = useFetch(() => getDocuments().catch(() => null), []);
  const { data: faqRes } = useFetch(() => getFaqs().catch(() => null), []);

  const allDocs = useMemo(() => (Array.isArray(docRes?.data) ? docRes.data : []), [docRes]);

  const summaryCards = useMemo(() => {
    const countMap = {};
    allDocs.forEach(d => {
      countMap[d.categoryName] = (countMap[d.categoryName] || 0) + 1;
    });
    return DEPT_OPTIONS.filter(d => d !== '전체 부서').map(dept => ({
      dept,
      colorKey: CATEGORY_COLOR_MAP[dept] ?? COLOR_KEYS.BLUE,
      icon: CATEGORY_ICON[dept] ?? dept,
      count: countMap[dept] ?? 0,
    }));
  }, [allDocs]);

  const filteredDocs = useMemo(() => {
    let list = allDocs.filter(d => d.categoryName === selectedDept);
    if (search.trim()) list = list.filter(d => d.title.includes(search.trim()));
    if (sort === '오래된순')
      list = [...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sort === '조회순') list = [...list].sort((a, b) => b.viewCount - a.viewCount);
    else list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }, [allDocs, selectedDept, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / PAGE_SIZE));
  const pagedDocs = filteredDocs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const faqItems = useMemo(() => {
    const list = Array.isArray(faqRes?.data) ? faqRes.data : [];
    return list
      .filter(f => f.categoryName === selectedDept)
      .slice(0, 4)
      .map(f => ({
        id: f.id,
        colorKey: CATEGORY_COLOR_MAP[f.categoryName] ?? COLOR_KEYS.BLUE,
        question: f.question,
        tags: f.categoryName,
      }));
  }, [faqRes, selectedDept]);

  function handleDeptSelect(option) {
    setDeptOpen(false);
    setPage(1);
    if (option === '전체 부서') navigate(ROUTES.DOC.LIST);
    else navigate(ROUTES.DOC.DEPT_PATH(option));
  }

  function handleSearch(e) {
    setSearch(e.target.value);
    setPage(1);
  }

  function handleSort(opt) {
    setSort(opt);
    setSortOpen(false);
    setPage(1);
  }

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
                onChange={handleSearch}
              />
              <span className={styles.inputIcon}>
                <IconSearch />
              </span>
            </div>
          </div>

          <div className={styles.filterField}>
            <label className={styles.filterLabel}>부서</label>
            <div
              className={`${styles.select} ${deptOpen ? styles.selectOpen : ''}`}
              onClick={() => setDeptOpen(o => !o)}
            >
              <span>{selectedDept}</span>
              <span className={`${styles.selectArrow} ${deptOpen ? styles.selectArrowUp : ''}`}>
                <IconChevronDown />
              </span>
            </div>
            {deptOpen && (
              <ul className={styles.dropdown}>
                {DEPT_OPTIONS.map(option => (
                  <li
                    key={option}
                    className={`${styles.dropdownItem} ${option === selectedDept ? styles.dropdownItemActive : ''}`}
                    onClick={() => handleDeptSelect(option)}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.filterField}>
            <label className={styles.filterLabel}>정렬</label>
            <div
              className={`${styles.select} ${sortOpen ? styles.selectOpen : ''}`}
              onClick={() => setSortOpen(o => !o)}
            >
              <span>{sort}</span>
              <span className={`${styles.selectArrow} ${sortOpen ? styles.selectArrowUp : ''}`}>
                <IconChevronDown />
              </span>
            </div>
            {sortOpen && (
              <ul className={styles.dropdown}>
                {SORT_OPTIONS.map(opt => (
                  <li
                    key={opt}
                    className={`${styles.dropdownItem} ${opt === sort ? styles.dropdownItemActive : ''}`}
                    onClick={() => handleSort(opt)}
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={styles.summaryRow}>
          {summaryCards.map(({ dept, colorKey, icon, count }) => (
            <div
              key={dept}
              className={`${styles.summaryCard} ${dept === selectedDept ? styles.summaryCardActive : ''}`}
              onClick={() => {
                setPage(1);
                navigate(ROUTES.DOC.DEPT_PATH(dept));
              }}
            >
              <div className={`${styles.summaryIcon} ${styles[colorKey]}`}>{icon}</div>
              <div className={styles.summaryText}>
                <span className={styles.summaryCount}>{count}</span>
                <span className={styles.summaryLabel}>{dept}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.contentGrid}>
        <section className={styles.docSection}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionHeadLeft}>
              <span className={styles.sectionTitle}>{selectedDept} 문서</span>
              <Badge colorKey={CATEGORY_COLOR_MAP[selectedDept] ?? COLOR_KEYS.BLUE}>
                총 {filteredDocs.length}건
              </Badge>
            </div>
          </div>

          {loading ? (
            <Spinner />
          ) : (
            <>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>문서명</th>
                    <th>부서</th>
                    <th>조회수</th>
                    <th>등록일</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedDocs.map(doc => (
                    <tr
                      key={doc.id}
                      className={styles.tableRow}
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <td>
                        <span className={styles.titleText}>{doc.title}</span>
                      </td>
                      <td>
                        <Badge
                          colorKey={CATEGORY_COLOR_MAP[doc.categoryName] ?? COLOR_KEYS.BLUE}
                          size={BADGE_SIZES.SM}
                        >
                          {doc.categoryName}
                        </Badge>
                      </td>
                      <td>
                        <span className={styles.secondary}>{doc.viewCount ?? 0}</span>
                      </td>
                      <td>
                        <span className={styles.secondary}>{formatDate(doc.createdAt)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredDocs.length === 0 && (
                <p className={styles.empty}>해당 부서의 문서가 없습니다.</p>
              )}

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.pageArrow}
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      className={`${styles.pageNum} ${p === page ? styles.pageNumActive : ''}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    className={styles.pageArrow}
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <aside className={styles.sideStack}>
          <section className={styles.sideCard}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionTitle}>관련 FAQ</span>
              <button className={styles.linkBtn} onClick={() => navigate(ROUTES.DOC.LIST)}>
                전체보기 ›
              </button>
            </div>
            {faqItems.length > 0 ? (
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
            ) : (
              <p className={styles.empty}>관련 FAQ가 없습니다.</p>
            )}
            <div className={styles.faqActions}>
              <button className={styles.btnPrimary} onClick={() => navigate(ROUTES.DOC.LIST)}>
                AI에게 물어보기
              </button>
              <button className={styles.btnOutline} onClick={() => setQuestionOpen(true)}>
                질문하기
              </button>
            </div>
          </section>
        </aside>
      </div>

      {selectedDoc && <DocDetailModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />}
      {questionOpen && <QnaQuestionModal onClose={() => setQuestionOpen(false)} />}
    </div>
  );
}

export default DocFilterResultPage;
