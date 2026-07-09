import styles from './NotificationPanel.module.css';

const NOTIF_STATUS_LABEL = {
  RECEIVED: '접수',
  IN_PROGRESS: '처리중',
  ANSWERED: '완료',
  ON_HOLD: '보류',
};

const NOTIF_STATUS_CLASS = {
  RECEIVED:    'stReceived',
  IN_PROGRESS: 'stInProgress',
  ANSWERED:    'stAnswered',
  ON_HOLD:     'stOnHold',
};

function NotificationPanel({ notifications, onItemClick, onMarkAll, onClearAll }) {
  const hasUnread = notifications.some(n => !n.read);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>알림</span>
        <div className={styles.headerActions}>
          <button className={styles.markAll} onClick={onMarkAll} disabled={!hasUnread}>
            모두 읽음
          </button>
          <button
            className={styles.clearAll}
            onClick={onClearAll}
            disabled={notifications.length === 0}
          >
            알림 삭제
          </button>
        </div>
      </div>

      <ul className={styles.list}>
        {notifications.length === 0 && <li className={styles.empty}>새로운 알림이 없습니다.</li>}
        {notifications.map(n => (
          <li
            key={n.id}
            className={`${styles.item} ${n.read ? '' : styles.itemUnread}`}
            onClick={() => onItemClick(n.id)}
          >
            <span className={`${styles.pill} ${styles[NOTIF_STATUS_CLASS[n.status]] ?? ''}`}>
              {NOTIF_STATUS_LABEL[n.status] ?? n.status}
            </span>
            <div className={styles.body}>
              <span className={styles.itemTitle}>{n.title}</span>
              <span className={styles.itemTime}>{n.time}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotificationPanel;
