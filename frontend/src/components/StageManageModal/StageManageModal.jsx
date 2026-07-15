import { useState, useEffect } from 'react';
import styles from './StageManageModal.module.css';
import useFetch from '../../hooks/useFetch';
import useToastStore from '../../stores/toastStore';
import { getEducationDetail, createStage, updateStage, deleteStage } from '../../api/eduApi';
import Spinner from '../Spinner/Spinner';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import EmptyState from '../EmptyState/EmptyState';

function IconX() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
      <path
        d="M1 1l12 12M13 1L1 13"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const EMPTY_FORM = { title: '', description: '', orderNumber: '', videoTitle: '', videoUrl: '' };

// 백엔드 @Pattern과 동일: http:// 또는 https://로 시작하는 URL만 허용
const VIDEO_URL_PATTERN = /^https?:\/\/.+/;

function StageManageModal({ education, onClose }) {
  const [mode, setMode] = useState('list'); // 'list' | 'form'
  const [editStage, setEditStage] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    data,
    loading,
    error: loadError,
  } = useFetch(() => getEducationDetail(education.educationId), [refreshKey]);
  const stages = data?.data?.stages ?? [];

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  function setField(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function openCreate() {
    setEditStage(null);
    setForm({ ...EMPTY_FORM, orderNumber: String(stages.length + 1) });
    setError('');
    setMode('form');
  }

  function openEdit(stage) {
    const material = stage.materials?.[0];
    setEditStage(stage);
    setForm({
      title: stage.title ?? '',
      description: stage.description ?? '',
      orderNumber: stage.orderNumber != null ? String(stage.orderNumber) : '',
      videoTitle: material?.title ?? '',
      videoUrl: material?.videoUrl ?? '',
    });
    setError('');
    setMode('form');
  }

  async function handleDelete(stage) {
    if (!window.confirm(`"${stage.title}" 단계를 삭제하시겠습니까?`)) return;
    try {
      await deleteStage(stage.stageId);
      setRefreshKey(k => k + 1);
    } catch (err) {
      // 완료 이력/시청 진도가 있으면 백엔드가 409로 막으므로 그 사유를 보여준다
      useToastStore.getState().show(err.response?.data?.message || '단계 삭제에 실패했습니다.');
    }
  }

  // 백엔드 검증과 동일: 단계명 필수·100자, 순서 정수 1 이상, 영상 제목 필수, URL은 http(s):// 형식
  const orderNum = Number(form.orderNumber);
  const videoUrlValid = VIDEO_URL_PATTERN.test(form.videoUrl.trim());
  const canSubmit =
    Boolean(form.title.trim()) &&
    form.title.trim().length <= 100 &&
    form.orderNumber !== '' &&
    Number.isInteger(orderNum) &&
    orderNum >= 1 &&
    Boolean(form.videoTitle.trim()) &&
    videoUrlValid &&
    !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      const base = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        orderNumber: orderNum,
        videoTitle: form.videoTitle.trim(),
        videoUrl: form.videoUrl.trim(),
      };
      if (editStage) {
        await updateStage(editStage.stageId, base);
      } else {
        await createStage({ educationId: education.educationId, ...base });
      }
      setRefreshKey(k => k + 1);
      setMode('list');
    } catch (err) {
      setError(err.response?.data?.message || '단계 저장에 실패했습니다.');
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalTop}>
          <div className={styles.modalTitleWrap}>
            <h2 className={styles.title}>
              {mode === 'form' ? (editStage ? '단계 수정' : '단계 등록') : '단계 관리'}
            </h2>
            <p className={styles.subtitle}>{education.title}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            <IconX />
          </button>
        </div>

        {mode === 'list' && (
          <div className={styles.body}>
            <div className={styles.listHeader}>
              <span className={styles.listTitle}>단계 ({stages.length})</span>
              <button className={styles.btnPrimary} onClick={openCreate}>
                + 단계 추가
              </button>
            </div>

            {loading && <Spinner />}
            {!loading && loadError && <ErrorMessage />}
            {!loading && !loadError && stages.length === 0 && (
              <EmptyState message="등록된 단계가 없습니다." />
            )}
            {!loading && !loadError && stages.length > 0 && (
              <ul className={styles.stageList}>
                {stages.map(stage => (
                  <li key={stage.stageId} className={styles.stageItem}>
                    <span className={styles.orderBadge}>{stage.orderNumber}</span>
                    <div className={styles.stageBody}>
                      <span className={styles.stageTitle}>{stage.title}</span>
                      {stage.materials?.[0]?.title && (
                        <span className={styles.stageVideo}>🎬 {stage.materials[0].title}</span>
                      )}
                    </div>
                    <div className={styles.actionRow}>
                      <button className={styles.actionBtn} onClick={() => openEdit(stage)}>
                        수정
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        onClick={() => handleDelete(stage)}
                      >
                        삭제
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {mode === 'form' && (
          <div className={styles.body}>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>단계명</label>
                <input
                  className={styles.input}
                  placeholder="단계명을 입력하세요 (최대 100자)"
                  value={form.title}
                  maxLength={100}
                  onChange={e => setField('title', e.target.value)}
                />
              </div>

              <div className={`${styles.field} ${styles.fieldNarrow}`}>
                <label className={styles.fieldLabel}>순서</label>
                <input
                  className={styles.input}
                  type="number"
                  min="1"
                  placeholder="1"
                  value={form.orderNumber}
                  onChange={e => setField('orderNumber', e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>설명 (선택)</label>
                <textarea
                  className={styles.textarea}
                  placeholder="단계 설명을 입력하세요"
                  value={form.description}
                  onChange={e => setField('description', e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>영상 제목</label>
                <input
                  className={styles.input}
                  placeholder="영상 제목을 입력하세요"
                  value={form.videoTitle}
                  onChange={e => setField('videoTitle', e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>영상 URL</label>
                <input
                  className={styles.input}
                  placeholder="mp4 등 재생 가능한 영상 파일 URL"
                  value={form.videoUrl}
                  onChange={e => setField('videoUrl', e.target.value)}
                />
                {form.videoUrl.trim() && !videoUrlValid && (
                  <p className={styles.formError}>
                    영상 URL은 http:// 또는 https://로 시작해야 합니다.
                  </p>
                )}
              </div>
            </div>

            {error && <p className={styles.formError}>{error}</p>}

            <div className={styles.modalActions}>
              <button
                className={styles.btnOutline}
                onClick={() => setMode('list')}
                disabled={submitting}
              >
                취소
              </button>
              <button className={styles.btnPrimary} onClick={handleSubmit} disabled={!canSubmit}>
                {submitting ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StageManageModal;
