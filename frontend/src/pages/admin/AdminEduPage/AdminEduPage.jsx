import { useState } from 'react';
import styles from './AdminEduPage.module.css';
import useFetch from '../../../hooks/useFetch';
import { getEducations, getEducationDetail, deleteEducation } from '../../../api/eduApi';
import Spinner from '../../../components/Spinner/Spinner';
import ErrorMessage from '../../../components/ErrorMessage/ErrorMessage';
import EmptyState from '../../../components/EmptyState/EmptyState';
import EducationFormModal from '../../../components/EducationFormModal/EducationFormModal';

const TABS = [
  { key: 'course', label: '교육 과정 관리' },
  { key: 'progress', label: '진도 현황' },
];

function EducationSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editEducation, setEditEducation] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data, loading, error } = useFetch(
    () => getEducations({ page: 0, size: 100 }),
    [refreshKey]
  );
  const items = data?.data?.content ?? [];

  function openCreate() {
    setEditEducation(null);
    setModalOpen(true);
  }

  async function openEdit(edu) {
    // 목록 응답엔 설명·수료 기준이 없어 상세를 받아 폼을 prefill한다
    try {
      const res = await getEducationDetail(edu.educationId);
      setEditEducation(res?.data ?? null);
      setModalOpen(true);
    } catch {
      alert('교육 과정 정보를 불러오지 못했습니다.');
    }
  }

  async function handleDelete(edu) {
    if (!window.confirm(`"${edu.title}" 교육 과정을 삭제하시겠습니까?`)) return;
    try {
      await deleteEducation(edu.educationId);
      setRefreshKey(k => k + 1);
    } catch (err) {
      // 단계·진도가 있으면 백엔드가 409로 막으므로 그 사유를 그대로 보여준다
      alert(err.response?.data?.message || '교육 과정 삭제에 실패했습니다.');
    }
  }

  return (
    <section className={styles.tableCard}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>교육 과정 목록</h2>
          <p className={styles.sectionSubtitle}>교육 과정을 등록·수정·삭제하세요.</p>
        </div>
        <button className={styles.btnPrimary} onClick={openCreate}>
          + 과정 추가
        </button>
      </div>

      {loading && <Spinner />}
      {!loading && error && <ErrorMessage />}
      {!loading && !error && items.length === 0 && (
        <EmptyState message="등록된 교육 과정이 없습니다." />
      )}
      {!loading && !error && items.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>제목</th>
              <th>단계 수</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {items.map(edu => (
              <tr key={edu.educationId}>
                <td>
                  <span className={styles.titleText}>{edu.title}</span>
                </td>
                <td>
                  <span className={styles.secondary}>{edu.totalStages}단계</span>
                </td>
                <td>
                  <div className={styles.actionRow}>
                    <button className={styles.actionBtn} onClick={() => openEdit(edu)}>
                      수정
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                      onClick={() => handleDelete(edu)}
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <EducationFormModal
          education={editEducation}
          onClose={() => setModalOpen(false)}
          onSuccess={() => setRefreshKey(k => k + 1)}
        />
      )}
    </section>
  );
}

function ProgressSection() {
  return (
    <section className={styles.tableCard}>
      <EmptyState message="진도 현황 기능은 준비 중입니다." />
    </section>
  );
}

function AdminEduPage() {
  const [tab, setTab] = useState('course');

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>교육 관리</h1>
        <p className={styles.pageSubtitle}>교육 과정과 신입사원 진도를 관리하세요.</p>
      </div>

      <div className={styles.tabRow}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`${styles.tabBtn} ${tab === t.key ? styles.tabBtnActive : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'course' ? <EducationSection /> : <ProgressSection />}
    </div>
  );
}

export default AdminEduPage;
