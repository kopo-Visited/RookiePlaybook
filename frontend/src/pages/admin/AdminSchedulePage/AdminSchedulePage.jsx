import { useState, useMemo, useCallback } from 'react';
import styles from './AdminSchedulePage.module.css';
import useFetch from '../../../hooks/useFetch';
import useToastStore from '../../../stores/toastStore';
import {
  getAdminSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from '../../../api/scheduleApi';

const DOT_COLORS = ['#2288FF', '#7C8CFF', '#4DABF7', '#9775FA', '#FF4D94', '#12B886', '#FFAD33'];

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${y}.${m}.${d}`;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const EMPTY_FORM = {
  title: '',
  place: '',
  scheduleDate: todayStr(),
  startTime: '09:00',
  endTime: '',
  dotColor: '#2288FF',
};

function ScheduleModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await onSave(form);
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>{initial ? '일정 수정' : '일정 추가'}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            제목 <span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="일정 제목"
          />

          <label className={styles.label}>장소</label>
          <input
            className={styles.input}
            name="place"
            value={form.place}
            onChange={handleChange}
            placeholder="장소 (선택)"
          />

          <label className={styles.label}>
            날짜 <span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            type="date"
            name="scheduleDate"
            value={form.scheduleDate}
            onChange={handleChange}
            required
          />

          <div className={styles.timeRow}>
            <div className={styles.timeField}>
              <label className={styles.label}>
                시작 시간 <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.input}
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.timeField}>
              <label className={styles.label}>종료 시간</label>
              <input
                className={styles.input}
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <label className={styles.label}>색상</label>
          <div className={styles.colorRow}>
            {DOT_COLORS.map(c => (
              <button
                key={c}
                type="button"
                className={`${styles.colorDot} ${form.dotColor === c ? styles.colorDotSelected : ''}`}
                style={{ background: c }}
                onClick={() => setForm(f => ({ ...f, dotColor: c }))}
              />
            ))}
          </div>

          <div className={styles.modalBtns}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              취소
            </button>
            <button type="submit" className={styles.saveBtn}>
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminSchedulePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const { data: apiRes, loading } = useFetch(() => getAdminSchedules(), [refreshKey]);
  const schedules = useMemo(() => apiRes?.data ?? [], [apiRes]);

  const grouped = useMemo(() => {
    const map = new Map();
    schedules.forEach(s => {
      const key = s.scheduleDate;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(s);
    });
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [schedules]);

  const handleSave = useCallback(
    async form => {
      try {
        if (editItem) {
          await updateSchedule(editItem.id, form);
          useToastStore.getState().show('일정이 수정되었습니다.');
        } else {
          await createSchedule(form);
          useToastStore.getState().show('일정이 추가되었습니다.');
        }
        setModalOpen(false);
        setEditItem(null);
        setRefreshKey(k => k + 1);
      } catch {
        useToastStore.getState().show('저장에 실패했습니다.');
      }
    },
    [editItem]
  );

  const handleDelete = useCallback(async id => {
    if (!window.confirm('일정을 삭제하시겠습니까?')) return;
    try {
      await deleteSchedule(id);
      useToastStore.getState().show('일정이 삭제되었습니다.');
      setRefreshKey(k => k + 1);
    } catch {
      useToastStore.getState().show('삭제에 실패했습니다.');
    }
  }, []);

  function openEdit(s) {
    setEditItem({
      id: s.id,
      title: s.title,
      place: s.place ?? '',
      scheduleDate: s.scheduleDate,
      startTime: s.startTime?.slice(0, 5) ?? '',
      endTime: s.endTime?.slice(0, 5) ?? '',
      dotColor: s.dotColor ?? '#2288FF',
    });
    setModalOpen(true);
  }

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div>
          <h1 className={styles.pageTitle}>일정 관리</h1>
          <p className={styles.pageSubtitle}>대시보드 오늘의 일정에 표시될 일정을 관리하세요.</p>
        </div>
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => {
            setEditItem(null);
            setModalOpen(true);
          }}
        >
          + 일정 추가
        </button>
      </header>

      <div className={styles.tableCard}>
        {loading && <p className={styles.empty}>불러오는 중...</p>}
        {!loading && schedules.length === 0 && (
          <p className={styles.empty}>등록된 일정이 없습니다.</p>
        )}
        {!loading &&
          grouped.map(([date, items]) => (
            <div key={date} className={styles.dateGroup}>
              <div className={styles.dateLabel}>{formatDate(date)}</div>
              {items.map(s => (
                <div key={s.id} className={styles.scheduleRow}>
                  <span className={styles.dot} style={{ background: s.dotColor ?? '#2288FF' }} />
                  <span className={styles.time}>{s.startTime?.slice(0, 5)}</span>
                  <span className={styles.title}>{s.title}</span>
                  <span className={styles.place}>{s.place}</span>
                  <div className={styles.actions}>
                    <button type="button" className={styles.actionBtn} onClick={() => openEdit(s)}>
                      수정
                    </button>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                      onClick={() => handleDelete(s.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
      </div>

      {modalOpen && (
        <ScheduleModal
          initial={editItem}
          onClose={() => {
            setModalOpen(false);
            setEditItem(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default AdminSchedulePage;
