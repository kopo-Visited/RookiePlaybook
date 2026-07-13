import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminDocPage.module.css';
import AdminDocModal from './AdminDocModal';
import useFetch from '../../../hooks/useFetch';
import useToastStore from '../../../stores/toastStore';
import {
  getAdminDocuments,
  getAdminFaqs,
  createAdminFaq,
  updateAdminFaq,
  deleteAdminFaq,
  deleteDocument,
  updateDocument,
  reviewDocument,
} from '../../../api/docApi';
import Badge from '../../../components/Badge/Badge';
import Dropdown from '../../../components/Dropdown/Dropdown';
import { COLOR_KEYS, BADGE_SIZES, DEPT_COLOR } from '../../../constants/styles';
import { ROUTES } from '../../../constants/routes';

const STALE_THRESHOLD_DAYS = 90;
const PAGE_SIZE = 10;

function AdminFaqCreateModal({ onClose, onCreated, categoryOptions }) {
  const firstCatId = categoryOptions[0]?.value ?? null;
  const [form, setForm] = useState({ categoryId: firstCatId, question: '', answer: '', isPublic: true });
  const [saving, setSaving] = useState(false);

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    try {
      await createAdminFaq(form);
      onCreated();
      onClose();
    } catch {
      useToastStore.getState().show('FAQ 등록에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>FAQ 등록</h2>
          <button className={styles.modalClose} onClick={onClose}>
            ✕
          </button>
        </div>
        <form className={styles.modalForm} onSubmit={handleSubmit}>
          <label className={styles.formLabel}>카테고리</label>
          <select
            className={styles.formInput}
            value={form.categoryId}
            onChange={e => handleChange('categoryId', Number(e.target.value))}
          >
            {categoryOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <label className={styles.formLabel}>질문</label>
          <input
            className={styles.formInput}
            placeholder="질문을 입력하세요"
            value={form.question}
            onChange={e => handleChange('question', e.target.value)}
            required
          />

          <label className={styles.formLabel}>답변</label>
          <textarea
            className={styles.formTextarea}
            placeholder="답변을 입력하세요"
            value={form.answer}
            onChange={e => handleChange('answer', e.target.value)}
            rows={5}
            required
          />

          <label className={styles.formCheckLabel}>
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={e => handleChange('isPublic', e.target.checked)}
            />
            공개
          </label>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnOutline} onClick={onClose}>
              취소
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={saving}>
              {saving ? '저장 중...' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminFaqEditModal({ faq, onClose, onSaved, categoryOptions }) {
  const [form, setForm] = useState({
    categoryId: faq.categoryId,
    question: faq.question ?? '',
    answer: faq.answer ?? '',
    isPublic: faq.isPublic ?? true,
  });
  const [saving, setSaving] = useState(false);

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    try {
      await updateAdminFaq(faq.id, form);
      onSaved();
      onClose();
    } catch {
      useToastStore.getState().show('FAQ 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>FAQ 수정</h2>
          <button className={styles.modalClose} onClick={onClose}>
            ✕
          </button>
        </div>
        <form className={styles.modalForm} onSubmit={handleSubmit}>
          <label className={styles.formLabel}>카테고리</label>
          <select
            className={styles.formInput}
            value={form.categoryId}
            onChange={e => handleChange('categoryId', Number(e.target.value))}
          >
            {categoryOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <label className={styles.formLabel}>질문</label>
          <input
            className={styles.formInput}
            placeholder="질문을 입력하세요"
            value={form.question}
            onChange={e => handleChange('question', e.target.value)}
            required
          />

          <label className={styles.formLabel}>답변</label>
          <textarea
            className={styles.formTextarea}
            placeholder="답변을 입력하세요"
            value={form.answer}
            onChange={e => handleChange('answer', e.target.value)}
            rows={5}
            required
          />

          <label className={styles.formCheckLabel}>
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={e => handleChange('isPublic', e.target.checked)}
            />
            공개
          </label>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnOutline} onClick={onClose}>
              취소
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const STATUS_COLOR = {
  공개: COLOR_KEYS.BLUE2,
  비공개: COLOR_KEYS.AMBER,
};

function StatCard({ label, value, sub, subColor, colorKey, iconText }) {
  return (
    <div className={styles.statCard}>
      <div className={`${styles.statIcon} ${styles[colorKey]}`}>{iconText}</div>
      <div className={styles.statBody}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statValue}>{value}</span>
        <span className={styles.statSub} style={{ color: subColor }}>
          {sub}
        </span>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <Badge colorKey={STATUS_COLOR[status] ?? COLOR_KEYS.AMBER} size={BADGE_SIZES.SM}>
      {status}
    </Badge>
  );
}

function ActionButtons({ row, onEdit, onDelete, onTogglePublic }) {
  return (
    <div className={styles.actionRow}>
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

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function AdminDocPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editFaq, setEditFaq] = useState(null);
  const [editDoc, setEditDoc] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [faqRefreshKey, setFaqRefreshKey] = useState(0);
  const [page, setPage] = useState(1);

  const { data: apiRes, loading } = useFetch(() => getAdminDocuments(), [refreshKey]);
  const docs = useMemo(() => apiRes?.data ?? [], [apiRes]);

  const { data: faqRes } = useFetch(() => getAdminFaqs(), [faqRefreshKey]);
  const faqs = useMemo(() => (Array.isArray(faqRes?.data) ? faqRes.data : []), [faqRes]);
  const totalFaqs = faqs.length;

  const faqCategoryOptions = useMemo(() => {
    const seen = new Map();
    faqs.forEach(f => { if (f.categoryId && !seen.has(f.categoryId)) seen.set(f.categoryId, f.categoryName); });
    return Array.from(seen.entries()).map(([value, label]) => ({ value, label }));
  }, [faqs]);

  const publicDocs = useMemo(() => docs.filter(d => d.isPublic).length, [docs]);
  const privateDocs = useMemo(() => docs.filter(d => !d.isPublic).length, [docs]);

  const staleDocs = useMemo(() => {
    const now = Date.now();
    const lastActivity = d => new Date(d.lastReviewedAt ?? d.updatedAt ?? d.createdAt).getTime();
    return docs
      .filter(d => (now - lastActivity(d)) / (1000 * 60 * 60 * 24) >= STALE_THRESHOLD_DAYS)
      .sort((a, b) => lastActivity(a) - lastActivity(b))
      .slice(0, 3)
      .map(d => ({
        id: d.id,
        title: d.title,
        dept: d.categoryName,
        daysAgo: Math.floor((now - lastActivity(d)) / (1000 * 60 * 60 * 24)),
      }));
  }, [docs]);

  const statCards = useMemo(
    () => [
      {
        key: 'total',
        label: '전체 문서',
        value: `${docs.length}건`,
        sub: '전체 등록 문서',
        subColor: '#12B886',
        colorKey: 'blue',
        iconText: 'Doc',
      },
      {
        key: 'public',
        label: '공개 문서',
        value: `${publicDocs}건`,
        sub: '사용자에게 노출',
        subColor: '#12B886',
        colorKey: 'green',
        iconText: 'Pub',
      },
      {
        key: 'private',
        label: '비공개 문서',
        value: `${privateDocs}건`,
        sub: '비공개 처리 문서',
        subColor: 'var(--color-text-label)',
        colorKey: 'orange',
        iconText: 'Prv',
      },
      {
        key: 'review',
        label: '검토 필요',
        value: `${staleDocs.length}건`,
        sub: `${STALE_THRESHOLD_DAYS}일 이상 미갱신`,
        subColor: '#FF4D94',
        colorKey: 'pink',
        iconText: 'Rev',
      },
      {
        key: 'faq',
        label: '등록 FAQ',
        value: `${totalFaqs}건`,
        sub: '전체 FAQ 목록',
        subColor: '#12B886',
        colorKey: 'purple',
        iconText: 'FAQ',
      },
    ],
    [docs, publicDocs, privateDocs, staleDocs, totalFaqs]
  );

  const filtered = useMemo(
    () =>
      docs.filter(row => {
        const matchSearch =
          !search || row.title.includes(search) || row.categoryName.includes(search);
        const matchCategory = !categoryFilter || row.categoryName === categoryFilter;
        const publicStatus = row.isPublic ? '공개' : '비공개';
        const matchStatus = !statusFilter || publicStatus === statusFilter;
        return matchSearch && matchCategory && matchStatus;
      }),
    [docs, search, categoryFilter, statusFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedDocs = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, statusFilter]);

  const handleCreated = useCallback(() => setRefreshKey(k => k + 1), []);

  const handleEdit = useCallback(doc => {
    setEditDoc(doc);
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback(async doc => {
    if (!window.confirm(`"${doc.title}" 문서를 삭제하시겠습니까?`)) return;
    try {
      await deleteDocument(doc.id);
      setRefreshKey(k => k + 1);
    } catch {
      useToastStore.getState().show('문서 삭제에 실패했습니다.');
    }
  }, []);

  const handleTogglePublic = useCallback(async doc => {
    try {
      await updateDocument(doc.id, {
        categoryName: doc.categoryName,
        title: doc.title,
        content: doc.content,
        isPublic: !doc.isPublic,
      });
      setRefreshKey(k => k + 1);
    } catch {
      useToastStore.getState().show('공개 상태 변경에 실패했습니다.');
    }
  }, []);

  const handleReview = useCallback(async doc => {
    try {
      await reviewDocument(doc.id);
      setRefreshKey(k => k + 1);
    } catch {
      useToastStore.getState().show('검토 완료 처리에 실패했습니다.');
    }
  }, []);

  const categoryOptions = useMemo(
    () => [...new Set(docs.map(d => d.categoryName).filter(Boolean))].sort(),
    [docs]
  );

  const deptBars = useMemo(() => {
    const counts = new Map();
    docs.forEach(d => {
      const key = d.categoryName ?? '기타';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const max = sorted[0]?.[1] ?? 1;
    return sorted.map(([label, count]) => ({ label, count, ratio: count / max }));
  }, [docs]);

  const handleReset = () => {
    setSearch('');
    setCategoryFilter('');
    setStatusFilter('');
    setPage(1);
  };

  const handleDeleteFaq = useCallback(async faq => {
    if (!window.confirm(`"${faq.question}" FAQ를 삭제하시겠습니까?`)) return;
    try {
      await deleteAdminFaq(faq.id);
      setFaqRefreshKey(k => k + 1);
    } catch {
      useToastStore.getState().show('FAQ 삭제에 실패했습니다.');
    }
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.titleBlock}>
          <h1 className={styles.pageTitle}>콘텐츠 관리</h1>
          <p className={styles.pageSubtitle}>
            사내 지식문서와 FAQ를 등록하고 공개 상태를 관리하세요.
          </p>
        </div>
      </header>

      <div className={styles.statsGrid}>
        {statCards.map(card => (
          <StatCard key={card.key} {...card} />
        ))}
      </div>

      <div className={`${styles.tableCard} ${styles.tableCardTall}`}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>문서 관리</h2>
            <p className={styles.sectionSubtitle}>사내 지식문서, 파일, 공개 상태를 관리하세요.</p>
          </div>
          <button
            className={styles.btnPrimary}
            onClick={() => {
              setEditDoc(null);
              setModalOpen(true);
            }}
          >
            + 문서 등록
          </button>
        </div>

        <div className={styles.filters}>
          <div className={styles.searchWrap}>
            <input
              type="text"
              className={styles.filterSearch}
              placeholder="문서명 또는 카테고리 검색"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Dropdown
            className={styles.filterSelect}
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { value: '', label: '카테고리 전체' },
              ...categoryOptions.map(c => ({ value: c, label: c })),
            ]}
          />
          <Dropdown
            className={styles.filterSelect}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: '', label: '상태 전체' },
              { value: '공개', label: '공개' },
              { value: '비공개', label: '비공개' },
            ]}
          />
          <button className={styles.resetBtn} onClick={handleReset}>
            초기화
          </button>
        </div>

        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <colgroup>
              <col />
              <col className={styles.colCategory} />
              <col className={styles.colStatus} />
              <col className={styles.colDate} />
              <col className={styles.colNum} />
              <col className={styles.colActionsWide} />
            </colgroup>
            <thead>
              <tr>
                <th>문서명</th>
                <th>카테고리</th>
                <th>상태</th>
                <th>등록일</th>
                <th>조회수</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className={styles.textCell}
                    style={{ textAlign: 'center', padding: '40px' }}
                  >
                    불러오는 중...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className={styles.textCell}
                    style={{ textAlign: 'center', padding: '40px' }}
                  >
                    문서가 없습니다.
                  </td>
                </tr>
              )}
              {!loading &&
                pagedDocs.map(row => {
                  const publicStatus = row.isPublic ? '공개' : '비공개';
                  return (
                    <tr key={row.id}>
                      <td>
                        <span className={styles.docTitle}>{row.title}</span>
                      </td>
                      <td>
                        <div>
                          <Badge
                            colorKey={DEPT_COLOR[row.categoryName] ?? COLOR_KEYS.BLUE}
                            size={BADGE_SIZES.SM}
                          >
                            {row.categoryName}
                          </Badge>
                        </div>
                      </td>
                      <td>
                        <div>
                          <StatusBadge status={publicStatus} />
                        </div>
                      </td>
                      <td className={styles.textCell}>{formatDate(row.createdAt)}</td>
                      <td className={styles.textCell}>{row.viewCount}</td>
                      <td>
                        <ActionButtons
                          row={row}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onTogglePublic={handleTogglePublic}
                        />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

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
                className={`${styles.pageNum} ${n === page ? styles.pageNumActive : ''}`}
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
      </div>

      <div className={styles.bottomGrid}>
        <div className={styles.bottomCard}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>카테고리별 문서 현황</h2>
              <p className={styles.sectionSubtitle}>전체 문서 기준 (상위 5개)</p>
            </div>
            <span className={styles.totalBadge}>
              <span className={styles.totalDot} />총 {docs.length}건
            </span>
          </div>
          <div className={styles.barList}>
            {deptBars.length === 0 && <p className={styles.emptyText}>등록된 문서가 없습니다.</p>}
            {deptBars.map(({ label, count, ratio }) => (
              <div key={label} className={styles.barRow}>
                <span className={styles.barLabel}>{label}</span>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${ratio * 100}%` }} />
                </div>
                <span className={styles.barCount}>{count}건</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.bottomCard}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>문서 신선도 관리</h2>
              <p className={styles.sectionSubtitle}>오래된 문서를 우선 검토하세요.</p>
            </div>
            <button
              type="button"
              className={styles.resetBtn}
              onClick={() => navigate(ROUTES.ADMIN.DOC_STALE)}
            >
              전체보기
            </button>
          </div>
          <div className={styles.staleList}>
            {staleDocs.length === 0 && (
              <p className={styles.emptyText}>
                {STALE_THRESHOLD_DAYS}일 이상 미갱신 문서가 없습니다.
              </p>
            )}
            {staleDocs.map(doc => (
              <div key={doc.id} className={styles.staleItem}>
                <div className={styles.staleInfo}>
                  <span className={styles.staleTitle}>{doc.title}</span>
                  <span className={styles.staleMeta}>
                    {doc.dept} · 마지막 검토 {doc.daysAgo}일 전
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.reviewBtn}
                  onClick={() => handleReview(doc)}
                >
                  검토 완료
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      {modalOpen && (
        <AdminDocModal
          onClose={() => {
            setModalOpen(false);
            setEditDoc(null);
          }}
          onCreated={handleCreated}
          editDoc={editDoc}
          faqCategoryOptions={faqCategoryOptions}
        />
      )}
      <div className={styles.tableCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>FAQ 관리</h2>
            <p className={styles.sectionSubtitle}>등록된 FAQ를 수정하거나 삭제하세요.</p>
          </div>
          <button className={styles.btnOutline} onClick={() => setFaqModalOpen(true)}>
            + FAQ 등록
          </button>
        </div>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <colgroup>
              <col />
              <col className={styles.colCategory} />
              <col className={styles.colStatus} />
              <col className={styles.colActions} />
            </colgroup>
            <thead>
              <tr>
                <th>질문</th>
                <th>카테고리</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {faqs.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className={styles.textCell}
                    style={{ textAlign: 'center', padding: '40px' }}
                  >
                    등록된 FAQ가 없습니다.
                  </td>
                </tr>
              )}
              {faqs.map(faq => (
                <tr key={faq.id}>
                  <td>
                    <span className={styles.docTitle}>{faq.question}</span>
                  </td>
                  <td>
                    <div>
                      <Badge
                        colorKey={DEPT_COLOR[faq.categoryName] ?? COLOR_KEYS.BLUE}
                        size={BADGE_SIZES.SM}
                      >
                        {faq.categoryName}
                      </Badge>
                    </div>
                  </td>
                  <td>
                    <div>
                      <Badge
                        colorKey={faq.isPublic ? COLOR_KEYS.BLUE2 : COLOR_KEYS.AMBER}
                        size={BADGE_SIZES.SM}
                      >
                        {faq.isPublic ? '공개' : '비공개'}
                      </Badge>
                    </div>
                  </td>
                  <td>
                    <div className={styles.actionRow}>
                      <button className={styles.actionBtn} onClick={() => setEditFaq(faq)}>
                        수정
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        onClick={() => handleDeleteFaq(faq)}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {faqModalOpen && (
        <AdminFaqCreateModal
          onClose={() => setFaqModalOpen(false)}
          onCreated={() => setFaqRefreshKey(k => k + 1)}
          categoryOptions={faqCategoryOptions}
        />
      )}
      {editFaq && (
        <AdminFaqEditModal
          faq={editFaq}
          onClose={() => setEditFaq(null)}
          onSaved={() => setFaqRefreshKey(k => k + 1)}
          categoryOptions={faqCategoryOptions}
        />
      )}
    </div>
  );
}

export default AdminDocPage;
