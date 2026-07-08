import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './DocFilterResultPage.module.css';
import Badge from '../../../components/Badge/Badge';
import DocDetailModal from '../../../components/DocDetailModal/DocDetailModal';
import QnaQuestionModal from '../../../components/QnaQuestionModal/QnaQuestionModal';
import { COLOR_KEYS, BADGE_SIZES, DOC_TYPE_COLOR, DEPT_COLOR } from '../../../constants/styles';
import { ROUTES } from '../../../constants/routes';
import { ALL_DOCS } from '../../../constants/docData';

const DEPT_OPTIONS         = ['전체 부서', '개발', '인프라', '보안', '네트워크', '공통'];
const CONTENT_TYPE_OPTIONS = ['전체', '문서', 'FAQ'];
const SORT_OPTIONS         = ['최신순', '오래된순', '조회순'];

const faqItems = [
  { id: 1, colorKey: COLOR_KEYS.BLUE,   question: 'Git 충돌이 나면 어떻게 하나요?',      tags: '개발 · Git · PR' },
  { id: 2, colorKey: COLOR_KEYS.GREEN,  question: '서버 접속 권한은 어디서 요청하나요?',  tags: '인프라 · 권한' },
  { id: 3, colorKey: COLOR_KEYS.PINK,   question: '개인정보 파일은 어떻게 공유하나요?',   tags: '보안 · 개인정보' },
  { id: 4, colorKey: COLOR_KEYS.ORANGE, question: 'VPN이 안 될 때 무엇을 확인하나요?',   tags: '네트워크 · VPN' },
];

const summaryCards = [
  { id: 'dev',   dept: '개발',    colorKey: COLOR_KEYS.BLUE,   icon: 'Dev',   count: 48, label: '개발 · 환경 세팅 · Git · PR' },
  { id: 'infra', dept: '인프라',  colorKey: COLOR_KEYS.GREEN,  icon: 'Infra', count: 36, label: '인프라 · 서버 · 배포 · 로그' },
  { id: 'sec',   dept: '보안',    colorKey: COLOR_KEYS.PINK,   icon: 'Sec',   count: 32, label: '보안 · 계정 · 권한 · 사고 신고' },
  { id: 'net',   dept: '네트워크', colorKey: COLOR_KEYS.ORANGE, icon: 'Net',  count: 28, label: '네트워크 · VPN · IP · 방화벽' },
  { id: 'all',   dept: '공통',    colorKey: COLOR_KEYS.PURPLE, icon: 'All',   count: 64, label: '공통 · 회사 소개 · 협업툴' },
];

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
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DocFilterResultPage() {
  const { dept: selectedDept } = useParams();
  const navigate = useNavigate();
  const [search, setSearch]           = useState('');
  const [contentType, setContentType] = useState('전체');
  const [sort, setSort]               = useState('최신순');
  const [requiredOnly, setRequiredOnly] = useState(false);

  const deptRef        = useRef(null);
  const contentTypeRef = useRef(null);
  const sortRef        = useRef(null);
  const [deptOpen, setDeptOpen]               = useState(false);
  const [contentTypeOpen, setContentTypeOpen] = useState(false);
  const [sortOpen, setSortOpen]               = useState(false);
  const [selectedDoc, setSelectedDoc]         = useState(null);
  const [questionOpen, setQuestionOpen]       = useState(false);

  const filteredData = useMemo(() => {
    let list = ALL_DOCS.filter(d => d.dept === selectedDept);
    if (search.trim())        list = list.filter(d => d.title.includes(search.trim()));
    if (contentType === '문서') list = list.filter(d => d.category !== 'FAQ');
    if (contentType === 'FAQ')  list = list.filter(d => d.category === 'FAQ');
    if (requiredOnly)         list = list.filter(d => d.required);
    if (sort === '오래된순')   list = [...list].sort((a, b) => a.date.localeCompare(b.date));
    else if (sort === '조회순') list = [...list].sort((a, b) => b.views - a.views);
    else                      list = [...list].sort((a, b) => b.date.localeCompare(a.date));
    return list;
  }, [selectedDept, search, contentType, sort, requiredOnly]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (deptRef.current && !deptRef.current.contains(e.target))               setDeptOpen(false);
      if (contentTypeRef.current && !contentTypeRef.current.contains(e.target)) setContentTypeOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target))               setSortOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleDeptSelect(option) {
    setDeptOpen(false);
    if (option === '전체 부서') {
      navigate(ROUTES.DOC.LIST);
    } else {
      navigate(ROUTES.DOC.DEPT_PATH(option));
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>부서별 지식문서 / FAQ</h1>
        <p className={styles.pageSubtitle}>
          개발 · 인프라 · 보안 · 네트워크 신입이 오늘 바로 따라 할 수 있는 문서와 FAQ를 모았어요.
        </p>
      </div>

      {/* 필터 카드 */}
      <section className={styles.filterCard}>
        <div className={styles.filterRow}>
          <div className={`${styles.filterField} ${styles.filterFieldWide}`}>
            <label className={styles.filterLabel}>검색어</label>
            <div className={styles.inputWrap}>
              <input
                className={styles.input}
                placeholder="검색어를 입력하세요"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <span className={styles.inputIcon}><IconSearch /></span>
            </div>
          </div>

          <div className={styles.filterField} ref={deptRef}>
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

          {/* 콘텐츠 유형 */}
          <div className={styles.filterField} ref={contentTypeRef}>
            <label className={styles.filterLabel}>콘텐츠 유형</label>
            <div
              className={`${styles.select} ${contentTypeOpen ? styles.selectOpen : ''}`}
              onClick={() => setContentTypeOpen(o => !o)}
            >
              <span>{contentType}</span>
              <span className={`${styles.selectArrow} ${contentTypeOpen ? styles.selectArrowUp : ''}`}>
                <IconChevronDown />
              </span>
            </div>
            {contentTypeOpen && (
              <ul className={styles.dropdown}>
                {CONTENT_TYPE_OPTIONS.map(opt => (
                  <li
                    key={opt}
                    className={`${styles.dropdownItem} ${opt === contentType ? styles.dropdownItemActive : ''}`}
                    onClick={() => { setContentType(opt); setContentTypeOpen(false); }}
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 정렬 */}
          <div className={styles.filterField} ref={sortRef}>
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
                    onClick={() => { setSort(opt); setSortOpen(false); }}
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.checkboxWrap}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={requiredOnly}
                onChange={e => setRequiredOnly(e.target.checked)}
              />
              <span className={styles.checkboxBox} />
              <span>필독만 보기</span>
            </label>
          </div>
        </div>

        <div className={styles.summaryRow}>
          {summaryCards.map(({ id, dept: cardDept, colorKey, icon, count, label }) => (
            <div
              key={id}
              className={`${styles.summaryCard} ${cardDept === selectedDept ? styles.summaryCardActive : ''}`}
              onClick={() => navigate(ROUTES.DOC.DEPT_PATH(cardDept))}
            >
              <div className={`${styles.summaryIcon} ${styles[colorKey]}`}>{icon}</div>
              <div className={styles.summaryText}>
                <span className={styles.summaryCount}>{count}</span>
                <span className={styles.summaryLabel}>{label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 콘텐츠 그리드 */}
      <div className={styles.contentGrid}>
        {/* 문서 테이블 */}
        <section className={styles.docSection}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionHeadLeft}>
              <span className={styles.sectionTitle}>{selectedDept} 문서</span>
              <Badge colorKey={DEPT_COLOR[selectedDept] ?? COLOR_KEYS.BLUE}>
                총 {filteredData.length}건
              </Badge>
            </div>
            <button className={styles.linkBtn}>전체보기 ›</button>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>문서명</th>
                <th>부서</th>
                <th>핵심 방향</th>
                <th>유형</th>
                <th>최근 검토</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(doc => (
                <tr key={doc.id} className={styles.tableRow} onClick={() => setSelectedDoc(doc)}>
                  <td>
                    <div className={styles.titleCell}>
                      <Badge colorKey={DOC_TYPE_COLOR[doc.type]}>{doc.type}</Badge>
                      <span className={styles.titleText}>{doc.title}</span>
                      {doc.required && (
                        <Badge colorKey={COLOR_KEYS.RED} size={BADGE_SIZES.SM}>필수</Badge>
                      )}
                    </div>
                  </td>
                  <td>
                    <Badge colorKey={DEPT_COLOR[doc.dept]} size={BADGE_SIZES.SM}>{doc.dept}</Badge>
                  </td>
                  <td><span className={styles.secondary}>{doc.direction}</span></td>
                  <td><span className={styles.secondary}>{doc.category}</span></td>
                  <td><span className={styles.secondary}>{doc.date}</span></td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <p className={styles.empty}>해당 부서의 문서가 없습니다.</p>
          )}

          <div className={styles.pagination}>
            <button className={styles.pageArrow}>‹</button>
            <button className={`${styles.pageNum} ${styles.pageNumActive}`}>1</button>
            <button className={styles.pageArrow}>›</button>
          </div>
        </section>

        {/* 사이드 패널 */}
        <aside className={styles.sideStack}>
          <section className={styles.sideCard}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionTitle}>최근 FAQ</span>
              <button className={styles.linkBtn}>전체보기 ›</button>
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
            <div className={styles.faqActions}>
              <button className={styles.btnPrimary}>AI에게 물어보기</button>
              <button className={styles.btnOutline} onClick={() => setQuestionOpen(true)}>질문하기</button>
            </div>
          </section>
        </aside>
      </div>

      {selectedDoc && (
        <DocDetailModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}
      {questionOpen && (
        <QnaQuestionModal onClose={() => setQuestionOpen(false)} />
      )}
    </div>
  );
}

export default DocFilterResultPage;
