import { useState } from 'react';
import styles from './AdminQnaDetail.module.css';
import AdminQnaFaqModal from './AdminQnaFaqModal';

const QNA_STATUS_LABEL = {
  RECEIVED: '접수',
  IN_PROGRESS: '처리중',
  ANSWERED: '답변완료',
  ON_HOLD: '보류',
};

const QNA_STATUS_STYLE = {
  RECEIVED:    { color: '#FF4D94', background: '#FFF0F6' },
  IN_PROGRESS: { color: '#2288FF', background: '#EAF4FF' },
  ANSWERED:    { color: '#12B886', background: '#E6F8F2' },
  ON_HOLD:     { color: '#FFAD33', background: '#FFF5E6' },
};

const STATUS_OPTIONS = ['RECEIVED', 'IN_PROGRESS', 'ANSWERED', 'ON_HOLD'];

function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AdminQnaDetail({ question, onBack, onStatusChange, onAnswer }) {
  const [answer, setAnswer] = useState(question?.answer ?? '');
  const [statusDraft, setStatusDraft] = useState(question?.status ?? 'RECEIVED');
  const [reason, setReason] = useState('');
  const [faqOpen, setFaqOpen] = useState(false);

  if (!question) return null;

  const answered = question.status === 'ANSWERED';
  const statusStyle = QNA_STATUS_STYLE[question.status] ?? {};

  const history = [
    ...(answered
      ? [{ label: '처리중 → 답변 완료', by: '김부연', at: '26.07.03 12:00' }]
      : []),
    { label: '접수 → 처리중', by: '김부연', at: '26.07.03 11:00' },
    { label: '질문 등록', by: question.author, at: '26.07.03 9:00' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.mainCol}>
        <button className={styles.backBtn} onClick={onBack}>
          <IconBack />
          <span>목록으로</span>
        </button>

        <div className={styles.card}>
          <div className={styles.qHead}>
            <span
              className={styles.statusBadge}
              style={{ color: statusStyle.color, background: statusStyle.background }}
            >
              {QNA_STATUS_LABEL[question.status]}
            </span>
            <span className={styles.qDept}>{question.dept}</span>
          </div>
          <h1 className={styles.qTitle}>{question.title}</h1>
          <p className={styles.qContent}>{question.content}</p>
          <span className={styles.qMeta}>등록 2026.07.03 9:00</span>
        </div>

        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>{answered ? '답변 수정' : '답변 등록'}</h2>
          <textarea
            className={styles.answerArea}
            placeholder="신입사원이 이해하기 쉽도록 답변을 작성해주세요."
            value={answer}
            onChange={e => setAnswer(e.target.value)}
          />
          <div className={styles.actionRow}>
            <button className={styles.btnOutline} onClick={() => setFaqOpen(true)}>
              F4Q로 전환
            </button>
            <button
              className={styles.btnPrimary}
              onClick={() => onAnswer(question.id, answer)}
              disabled={!answer.trim()}
            >
              {answered ? '수정하기' : '답변 등록'}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.sideCol}>
        <div className={styles.card}>
          <h2 className={styles.sideTitle}>질문자</h2>
          <div className={styles.userRow}>
            <div className={styles.avatar}>{question.author[0]}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{question.author}</span>
              <span className={styles.userMeta}>
                {question.dept} / {question.email}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.sideTitle}>상태 관리</h2>
          <select
            className={styles.statusSelect}
            value={statusDraft}
            onChange={e => setStatusDraft(e.target.value)}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>
                {QNA_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <textarea
            className={styles.reasonArea}
            placeholder="간단한 변경 사유를 입력해주세요."
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
          <button
            className={styles.btnStatus}
            onClick={() => {
              onStatusChange(question.id, statusDraft);
              setReason('');
            }}
          >
            상태 변경
          </button>
        </div>

        <div className={styles.card}>
          <h2 className={styles.sideTitle}>처리 이력</h2>
          <ul className={styles.timeline}>
            {history.map((h, i) => (
              <li key={i} className={styles.timelineItem}>
                <span className={styles.dot} />
                <div className={styles.timelineBody}>
                  <span className={styles.timelineLabel}>{h.label}</span>
                  <span className={styles.timelineMeta}>
                    {h.by} / {h.at}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {faqOpen && (
        <AdminQnaFaqModal
          question={question}
          answer={answer}
          onClose={() => setFaqOpen(false)}
        />
      )}
    </div>
  );
}

export default AdminQnaDetail;
