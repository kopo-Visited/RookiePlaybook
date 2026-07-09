import { useState, useRef } from 'react';
import styles from './AdminDocModal.module.css';

const DEPTS = ['개발팀', '인프라팀', '보안팀', '네트워크팀'];
const CATEGORIES = ['환경 세팅', '협업 규칙', '서버 접속', '권한 관리', 'VPN', '요청 템플릿'];
const FILE_TYPES = ['DOCU', 'DOCX', 'PDF', 'XLSX', 'PPTX'];
const VISIBILITIES = ['공개', '비공개'];
const PRIORITIES = ['일반 문서', '필독 문서'];

function AdminDocModal({ onClose }) {
  const [form, setForm] = useState({
    title: '',
    dept: '',
    category: '',
    fileType: '',
    visibility: '공개',
    priority: '일반 문서',
    description: '',
  });
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleDrop = e => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleFileChange = e => {
    if (e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = () => {
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>문서 등록</h2>
            <p className={styles.modalSubtitle}>신입사원이 참고할 지식 문서를 추가합니다.</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label className={styles.label}>문서 제목</label>
            <input
              type="text"
              className={styles.input}
              placeholder="문서 제목을 입력하세요"
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>담당 부서</label>
            <select
              className={styles.select}
              value={form.dept}
              onChange={e => handleChange('dept', e.target.value)}
            >
              <option value="">부서 선택</option>
              {DEPTS.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>카테고리</label>
            <select
              className={styles.select}
              value={form.category}
              onChange={e => handleChange('category', e.target.value)}
            >
              <option value="">카테고리 선택</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>파일 유형</label>
            <select
              className={styles.select}
              value={form.fileType}
              onChange={e => handleChange('fileType', e.target.value)}
            >
              <option value="">유형 선택</option>
              {FILE_TYPES.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>공개 상태</label>
            <select
              className={styles.select}
              value={form.visibility}
              onChange={e => handleChange('visibility', e.target.value)}
            >
              {VISIBILITIES.map(v => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>중요도</label>
            <select
              className={styles.select}
              value={form.priority}
              onChange={e => handleChange('priority', e.target.value)}
            >
              {PRIORITIES.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={styles.label}>문서 설명</label>
            <textarea
              className={styles.textarea}
              placeholder="문서에 대한 간단한 설명을 입력하세요"
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
            />
          </div>

          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={styles.label}>파일 업로드</label>
            <div
              className={`${styles.dropZone} ${dragging ? styles.dragging : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              {file ? (
                <span className={styles.fileName}>{file.name}</span>
              ) : (
                <span className={styles.dropText}>파일을 드래그하거나 클릭해서 업로드</span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className={styles.hiddenInput}
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>
            취소
          </button>
          <button className={styles.submitBtn} onClick={handleSubmit}>
            등록하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDocModal;
