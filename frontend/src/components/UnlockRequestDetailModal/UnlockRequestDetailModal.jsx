import { useEffect } from 'react';
import styles from './UnlockRequestDetailModal.module.css';

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

function formatDateTime(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function UnlockRequestDetailModal({ request, resolving, onClose, onResolve }) {
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

  const isResolved = request.status === 'RESOLVED';

  const fields = [
    { label: '이름', value: request.name },
    { label: '이메일', value: request.email },
    { label: '사번', value: request.employeeNo },
    { label: '부서', value: request.departmentName },
    { label: '전화번호', value: request.phone },
    { label: '메모', value: request.memo || '-' },
    { label: '접수일', value: formatDateTime(request.createdAt) },
    { label: '상태', value: isResolved ? '처리완료' : '대기중' },
  ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalTop}>
          <h2 className={styles.title}>계정 잠금해제 요청 상세</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className={styles.detailGrid}>
          {fields.map(f => (
            <div className={styles.detailRow} key={f.label}>
              <span className={styles.detailLabel}>{f.label}</span>
              <span className={styles.detailValue}>{f.value}</span>
            </div>
          ))}
        </div>

        <div className={styles.modalActions}>
          <button className={styles.btnOutline} onClick={onClose}>
            닫기
          </button>
          <button
            className={styles.btnPrimary}
            disabled={isResolved || resolving}
            onClick={() => onResolve(request)}
          >
            {isResolved ? '처리완료' : resolving ? '처리 중...' : '비밀번호 초기화'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UnlockRequestDetailModal;
