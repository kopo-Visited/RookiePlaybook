import { useState, useEffect, useCallback } from 'react';
import styles from './AdminQnaDetail.module.css';
import AdminQnaFaqModal from './AdminQnaFaqModal';
import { getAdminQna, answerQna, updateQnaStatus } from '../../../api/qnaApi';
import { DEPT_COLOR, COLOR_KEYS, BADGE_SIZES } from '../../../constants/styles';
import Badge from '../../../components/Badge/Badge';
import Spinner from '../../../components/Spinner/Spinner';

const QNA_STATUS_LABEL = {
  RECEIVED: '접수',
  IN_PROGRESS: '처리중',
  ANSWERED: '답변완료',
  ON_HOLD: '보류',
};

const QNA_STATUS_CLASS = {
  RECEIVED: 'stReceived',
  IN_PROGRESS: 'stInProgress',
  ANSWERED: 'stAnswered',
  ON_HOLD: 'stOnHold',
};

const STATUS_OPTIONS = ['RECEIVED', 'IN_PROGRESS', 'ANSWERED', 'ON_HOLD'];

function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

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

function AdminQnaDetail({ questionId, onBack }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [statusDraft, setStatusDraft] = useState('RECEIVED');
  const [reason, setReason] = useState('');
  const [faqOpen, setFaqOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    return getAdminQna(questionId)
      .then(res => {
        const d = res?.data ?? null;
        setDetail(d);
        setAnswer(d?.answer?.content ?? '');
        setStatusDraft(d?.status ?? 'RECEIVED');
      })
      .catch(() => setError('상세 정보를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [questionId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !detail) {
    return (
      <div className={styles.page}>
        <div className={styles.mainCol}>
          <button className={styles.backBtn} onClick={onBack}>
            <IconBack />
            <span>목록으로</span>
          </button>
          <div className={styles.card}>
            <Spinner />
          </div>
        </div>
      </div>
    );
  }
  if (!detail) return null;

  const answered = detail.status === 'ANSWERED';
  const converted = detail.convertedFaqId != null;
  const writer = detail.writer ?? {};
  const avatarChar = (writer.name ?? '?')[0];

  const handleAnswer = async () => {
    if (!answer.trim() || busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await answerQna(questionId, { content: answer.trim() });
      setNotice(answered ? '답변이 수정되었습니다.' : '답변이 등록되었습니다.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || '답변 저장에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const handleHold = async () => {
    if (busy || detail.status === 'ON_HOLD') return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await updateQnaStatus(questionId, { status: 'ON_HOLD', memo: null });
      setNotice('보류 처리되었습니다.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || '보류 처리에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const handleStatus = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await updateQnaStatus(questionId, { status: statusDraft, memo: reason.trim() || null });
      setReason('');
      setNotice('상태가 변경되었습니다.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || '상태 변경에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

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
              className={`${styles.statusBadge} ${styles[QNA_STATUS_CLASS[detail.status]] ?? ''}`}
            >
              {QNA_STATUS_LABEL[detail.status]}
            </span>
            <Badge
              colorKey={DEPT_COLOR[detail.category?.name] ?? COLOR_KEYS.PURPLE}
              size={BADGE_SIZES.SM}
            >
              {detail.category?.name}
            </Badge>
          </div>
          <h1 className={styles.qTitle}>{detail.title}</h1>
          <p className={styles.qContent}>{detail.content}</p>
          <span className={styles.qMeta}>등록 {formatDateTime(detail.createdAt)}</span>
        </div>

        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>{answered ? '답변 수정' : '답변 등록'}</h2>
          <textarea
            className={styles.answerArea}
            placeholder="신입사원이 이해하기 쉽도록 답변을 작성해주세요."
            value={answer}
            onChange={e => setAnswer(e.target.value)}
          />
          {(notice || error) && (
            <p className={error ? styles.formError : styles.formNotice}>{error || notice}</p>
          )}
          <div className={styles.actionRow}>
            <button
              className={styles.btnOutline}
              onClick={() => setFaqOpen(true)}
              disabled={!answered || converted}
              title={
                converted
                  ? '이미 FAQ로 전환된 질문입니다'
                  : answered
                    ? ''
                    : '답변완료 상태만 FAQ로 전환할 수 있어요'
              }
            >
              {converted ? 'FAQ 전환됨' : 'FAQ로 전환'}
            </button>
            <button
              className={styles.btnHold}
              onClick={handleHold}
              disabled={busy || detail.status === 'ON_HOLD'}
            >
              보류
            </button>
            <button
              className={styles.btnPrimary}
              onClick={handleAnswer}
              disabled={!answer.trim() || busy}
            >
              {busy ? '저장 중…' : answered ? '수정하기' : '답변 등록'}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.sideCol}>
        <div className={styles.card}>
          <h2 className={styles.sideTitle}>질문자</h2>
          <div className={styles.userRow}>
            <div className={styles.avatar}>{avatarChar}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{writer.name ?? '-'}</span>
              <span className={styles.userMeta}>{writer.departmentName ?? '-'}</span>
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
          <button className={styles.btnStatus} onClick={handleStatus} disabled={busy}>
            상태 변경
          </button>
        </div>

        <div className={styles.card}>
          <h2 className={styles.sideTitle}>처리 이력</h2>
          {detail.histories?.length ? (
            <ul className={styles.timeline}>
              {detail.histories.map(h => (
                <li key={h.historyId} className={styles.timelineItem}>
                  <span className={styles.dot} />
                  <div className={styles.timelineBody}>
                    <span className={styles.timelineLabel}>
                      {h.previousStatus
                        ? `${QNA_STATUS_LABEL[h.previousStatus]} → ${QNA_STATUS_LABEL[h.newStatus]}`
                        : QNA_STATUS_LABEL[h.newStatus]}
                    </span>
                    <span className={styles.timelineMeta}>
                      {h.changedByName ?? '관리자'} / {formatDateTime(h.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.timelineEmpty}>처리 이력이 없습니다.</p>
          )}
        </div>
      </div>

      {faqOpen && (
        <AdminQnaFaqModal
          questionId={questionId}
          question={{
            title: detail.title,
            category: detail.category?.name,
            content: detail.content,
          }}
          answer={answer}
          onClose={() => setFaqOpen(false)}
          onSuccess={() => {
            setNotice('FAQ로 전환되었습니다.');
            load();
          }}
        />
      )}
    </div>
  );
}

export default AdminQnaDetail;
