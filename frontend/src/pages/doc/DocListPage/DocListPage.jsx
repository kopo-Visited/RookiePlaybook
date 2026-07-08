import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DocListPage.module.css';
import Badge from '../../../components/Badge/Badge';
import DocDetailModal from '../../../components/DocDetailModal/DocDetailModal';
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

const bookmarkItems = [
  { id: 1, colorKey: COLOR_KEYS.BLUE,   title: '개발 환경 세팅 가이드',      meta: '개발 · 2026.07.06' },
  { id: 2, colorKey: COLOR_KEYS.ORANGE, title: 'VPN 접속 방법 및 오류 해결', meta: '네트워크 · 2026.06.12' },
  { id: 3, colorKey: COLOR_KEYS.PINK,   title: '계정 보안과 권한 신청 절차', meta: '보안 · 2026.06.20' },
];

const summaryCards = [
  { id: 'dev',   dept: '개발',     colorKey: COLOR_KEYS.BLUE,   icon: 'Dev',   count: 48, label: '개발 · 환경 세팅 · Git · PR' },
  { id: 'infra', dept: '인프라',   colorKey: COLOR_KEYS.GREEN,  icon: 'Infra', count: 36, label: '인프라 · 서버 · 배포 · 로그' },
  { id: 'sec',   dept: '보안',     colorKey: COLOR_KEYS.PINK,   icon: 'Sec',   count: 32, label: '보안 · 계정 · 권한 · 사고 신고' },
  { id: 'net',   dept: '네트워크', colorKey: COLOR_KEYS.ORANGE, icon: 'Net',   count: 28, label: '네트워크 · VPN · IP · 방화벽' },
  { id: 'all',   dept: '공통',     colorKey: COLOR_KEYS.PURPLE, icon: 'All',   count: 64, label: '공통 · 회사 소개 · 협업툴' },
];

const onboardingCourses = [
  {
    id: 'dev',
    team: '개발팀',
    steps: [
      { badge: 'D1', title: '환경 세팅',    desc: 'Node, Java, Python 사내 표준 버전' },
      { badge: 'W1', title: '첫 PR 날리기', desc: '브랜치 전략, 커밋, 코드 리뷰' },
    ],
  },
  {
    id: 'infra',
    team: '인프라팀',
    steps: [
      { badge: 'D1', title: '서버 문 두드리기', desc: 'SSH 키 등록과 안전 접속' },
      { badge: 'W1', title: '로그와 배포 확인', desc: '배포 체크리스트와 알림 해석' },
    ],
  },
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

function IconHeart() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
  const [search, setSearch]           = useState('');
  const [dept, setDept]               = useState('전체 부서');
  const [contentType, setContentType] = useState('전체');
  const [sort, setSort]               = useState('최신순');
  const [requiredOnly, setRequiredOnly] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const deptDD        = useDropdown();
  const contentTypeDD = useDropdown();
  const sortDD        = useDropdown();

  const displayedDocs = useMemo(() => {
    let list = ALL_DOCS;
    if (search.trim())       list = list.filter(d => d.title.includes(search.trim()));
    if (contentType === '문서') list = list.filter(d => d.category !== 'FAQ');
    if (contentType === 'FAQ')  list = list.filter(d => d.category === 'FAQ');
    if (requiredOnly)        list = list.filter(d => d.required);
    if (sort === '오래된순') list = [...list].sort((a, b) => a.date.localeCompare(b.date));
    else if (sort === '조회순') list = [...list].sort((a, b) => b.views - a.views);
    else                     list = [...list].sort((a, b) => b.date.localeCompare(a.date));
    return list;
  }, [search, contentType, sort, requiredOnly]);

  function handleDeptSelect(option) {
    setDept(option);
    deptDD.setOpen(false);
    if (option !== '전체 부서') navigate(ROUTES.DOC.DEPT_PATH(option));
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

          {/* 부서 */}
          <div className={styles.filterField} ref={deptDD.ref}>
            <label className={styles.filterLabel}>부서</label>
            <div
              className={`${styles.select} ${deptDD.open ? styles.selectOpen : ''}`}
              onClick={() => deptDD.setOpen(o => !o)}
            >
              <span>{dept}</span>
              <span className={`${styles.selectArrow} ${deptDD.open ? styles.selectArrowUp : ''}`}>
                <IconChevronDown />
              </span>
            </div>
            {deptDD.open && (
              <ul className={styles.dropdown}>
                {DEPT_OPTIONS.map(opt => (
                  <li
                    key={opt}
                    className={`${styles.dropdownItem} ${opt === dept ? styles.dropdownItemActive : ''}`}
                    onClick={() => handleDeptSelect(opt)}
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 콘텐츠 유형 */}
          <div className={styles.filterField} ref={contentTypeDD.ref}>
            <label className={styles.filterLabel}>콘텐츠 유형</label>
            <div
              className={`${styles.select} ${contentTypeDD.open ? styles.selectOpen : ''}`}
              onClick={() => contentTypeDD.setOpen(o => !o)}
            >
              <span>{contentType}</span>
              <span className={`${styles.selectArrow} ${contentTypeDD.open ? styles.selectArrowUp : ''}`}>
                <IconChevronDown />
              </span>
            </div>
            {contentTypeDD.open && (
              <ul className={styles.dropdown}>
                {CONTENT_TYPE_OPTIONS.map(opt => (
                  <li
                    key={opt}
                    className={`${styles.dropdownItem} ${opt === contentType ? styles.dropdownItemActive : ''}`}
                    onClick={() => { setContentType(opt); contentTypeDD.setOpen(false); }}
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
                    onClick={() => { setSort(opt); sortDD.setOpen(false); }}
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
              className={styles.summaryCard}
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
        <section className={styles.docSection}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionHeadLeft}>
              <span className={styles.sectionTitle}>부서별 핵심 문서</span>
              <Badge colorKey={COLOR_KEYS.BLUE}>총 {displayedDocs.length}건</Badge>
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
              {displayedDocs.map(doc => (
                <tr key={doc.id} className={styles.tableRow} onClick={() => setSelectedDoc(doc)}>
                  <td>
                    <div className={styles.titleCell}>
                      <Badge colorKey={DOC_TYPE_COLOR[doc.type]}>{doc.type}</Badge>
                      <span className={styles.titleText}>{doc.title}</span>
                      {doc.required && <Badge colorKey={COLOR_KEYS.RED} size={BADGE_SIZES.SM}>필수</Badge>}
                    </div>
                  </td>
                  <td><Badge colorKey={DEPT_COLOR[doc.dept]} size={BADGE_SIZES.SM}>{doc.dept}</Badge></td>
                  <td><span className={styles.secondary}>{doc.direction}</span></td>
                  <td><span className={styles.secondary}>{doc.category}</span></td>
                  <td><span className={styles.secondary}>{doc.date}</span></td>
                </tr>
              ))}
            </tbody>
          </table>

          {displayedDocs.length === 0 && (
            <p className={styles.empty}>조건에 맞는 문서가 없습니다.</p>
          )}

          <div className={styles.pagination}>
            <button className={styles.pageArrow}>‹</button>
            <button className={`${styles.pageNum} ${styles.pageNumActive}`}>1</button>
            <button className={styles.pageNum}>2</button>
            <button className={styles.pageNum}>3</button>
            <button className={styles.pageNum}>4</button>
            <button className={styles.pageArrow}>›</button>
          </div>
        </section>

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
              <button className={styles.btnOutline}>질문하기</button>
            </div>
          </section>

          <section className={styles.sideCard}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionTitle}>내 북마크</span>
              <button className={styles.linkBtn}>전체보기 ›</button>
            </div>
            <ul className={styles.bookmarkList}>
              {bookmarkItems.map(({ id, colorKey, title, meta }) => (
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
            </ul>
          </section>
        </aside>
      </div>

      <section className={styles.onboardingSection}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionTitle}>부서별 온보딩 핵심 흐름</span>
          <button className={styles.linkBtn}>교육 전체보기 ›</button>
        </div>
        <div className={styles.onboardingGrid}>
          {onboardingCourses.map(({ id, team, steps }) => (
            <div key={id} className={styles.onboardingCard}>
              <span className={styles.onboardingTeam}>{team}</span>
              <div className={styles.onboardingSteps}>
                {steps.map(({ badge, title, desc }) => (
                  <div key={badge} className={styles.onboardingStep}>
                    <div className={`${styles.stepBadge} ${styles.blue}`}>{badge}</div>
                    <div className={styles.stepBody}>
                      <span className={styles.stepTitle}>{title}</span>
                      <span className={styles.stepDesc}>{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedDoc && (
        <DocDetailModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}
    </div>
  );
}

export default DocListPage;
