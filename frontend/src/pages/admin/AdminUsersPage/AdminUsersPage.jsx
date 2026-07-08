import { useMemo, useState } from 'react';
import styles from './AdminUsersPage.module.css';
import Button from '../../../components/Button/Button';
import useAuthStore from '../../../stores/authStore';
import { COLOR_KEYS, BUTTON_VARIANTS, BUTTON_SIZES } from '../../../constants/styles';

const STAT_CARDS = [
  {
    key: 'total',
    label: '전체 사용자',
    value: '1,248명',
    deltaDirection: 'up',
    delta: '▲ 7.2%',
    colorKey: COLOR_KEYS.BLUE,
    icon: <IconPerson />,
  },
  {
    key: 'active',
    label: '활성 사용자',
    value: '126명',
    deltaDirection: 'up',
    delta: '▲ 7.2%',
    colorKey: COLOR_KEYS.GREEN,
    icon: <IconDocText />,
  },
  {
    key: 'admin',
    label: '관리자 계정',
    value: '128명',
    deltaDirection: 'down',
    delta: '▼ 7.2%',
    colorKey: COLOR_KEYS.PINK,
    icon: <IconChatBubble />,
  },
  {
    key: 'inactive',
    label: '비활성 계정',
    value: '20명',
    deltaDirection: 'up',
    delta: '▲ 7.2%',
    colorKey: COLOR_KEYS.ORANGE,
    icon: <IconAcademicCap />,
  },
];

const DEPARTMENTS = ['개발팀', '인프라팀', '네트워크팀', '보안팀'];
const ROLES = ['사용자', '관리자'];
const STATUSES = ['활성', '비활성'];

const INITIAL_USERS = [
  {
    id: 1,
    name: '이00',
    dept: '개발팀',
    position: '대리',
    email: 'user1@company.com',
    role: '사용자',
    status: '활성',
    lastLoginAt: '2024.05.28 09:32',
    joinedAt: '2024.05.28',
  },
  {
    id: 2,
    name: '손00',
    dept: '보안팀',
    position: '과장',
    email: 'user2@company.com',
    role: '관리자',
    status: '활성',
    lastLoginAt: '2024.05.27 08:15',
    joinedAt: '2024.05.27',
  },
  {
    id: 3,
    name: '강00',
    dept: '인프라팀',
    position: '사원',
    email: 'user3@company.com',
    role: '사용자',
    status: '활성',
    lastLoginAt: '2024.05.26 17:41',
    joinedAt: '2024.05.26',
  },
  {
    id: 4,
    name: '진00',
    dept: '네트워크팀',
    position: '차장',
    email: 'user4@company.com',
    role: '관리자',
    status: '활성',
    lastLoginAt: '2024.05.25 11:22',
    joinedAt: '2024.05.25',
  },
  {
    id: 5,
    name: '김00',
    dept: '개발팀',
    position: '대리',
    email: 'user5@company.com',
    role: '관리자',
    status: '활성',
    lastLoginAt: '2024.05.24 10:48',
    joinedAt: '2024.05.24',
  },
];

const DEPT_DISTRIBUTION = [
  { key: 'dev', label: '개발팀', value: 312 },
  { key: 'infra', label: '인프라팀', value: 156 },
  { key: 'network', label: '네트워크팀', value: 248 },
  { key: 'security', label: '보안팀', value: 140 },
  { key: 'etc', label: '기타', value: 292 },
];

const RECENT_ACTIVITY = [
  { key: 'create', label: '신규 등록', count: 24, color: '#4285F4' },
  { key: 'role', label: '권한 변경', count: 12, color: '#72B17A' },
  { key: 'status', label: '상태 변경', count: 8, color: '#F1B54A' },
];

const ROLE_DISTRIBUTION = [
  { key: 'user', label: '일반 사용자', value: 1100, percent: '88.1%', color: '#4285F4' },
  { key: 'admin', label: '관리자', value: 128, percent: '10.3%', color: '#9CC2FF' },
  { key: 'inactive', label: '비활성', value: 20, percent: '1.6%', color: '#D7E7FF' },
];

const ROLE_DONUT_DATA = [
  { key: 'user', value: 1100, color: '#2288FF' },
  { key: 'admin', value: 128, color: '#60A5FA' },
  { key: 'inactive', value: 20, color: '#BFDBFE' },
];

const ROLE_DESCRIPTIONS = [
  {
    key: 'admin',
    label: '관리자',
    desc: '사용자 등록 · 수정 · 권한 변경 가능',
    color: '#4285F4',
    bg: '#EEF5FF',
  },
  {
    key: 'user',
    label: '사용자',
    desc: '지식 문서 조회 · 교육 수강 · 질문 등록',
    color: '#6EA6FF',
    bg: '#F2F8FF',
  },
  {
    key: 'inactive',
    label: '비활성',
    desc: '로그인 제한 · 권한 유지 상태',
    color: '#94A1B8',
    bg: '#F7FAFE',
  },
];

function IconPerson() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 20a8 8 0 0116 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconDocText() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 2h9l5 5v15a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M14 2v5h5M8 12h8M8 16h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChatBubble() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M7 9h.01M12 9h.01M17 9h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconAcademicCap() {
  return (
    <svg width="29" height="30" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3L2 8l10 5 10-5-10-5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M6 11.5v5c0 2.21 2.69 4 6 4s6-1.79 6-4v-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function describeDonutSegment(cx, cy, outerR, innerR, startAngle, endAngle) {
  const startOuter = polarToCartesian(cx, cy, outerR, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerR, startAngle);
  const startInner = polarToCartesian(cx, cy, innerR, startAngle);
  const endInner = polarToCartesian(cx, cy, innerR, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    'M',
    startOuter.x,
    startOuter.y,
    'A',
    outerR,
    outerR,
    0,
    largeArc,
    0,
    endOuter.x,
    endOuter.y,
    'L',
    startInner.x,
    startInner.y,
    'A',
    innerR,
    innerR,
    0,
    largeArc,
    1,
    endInner.x,
    endInner.y,
    'Z',
  ].join(' ');
}

function DonutChart({ data, size = 160 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const center = size / 2;
  const outerR = size / 2 - 6;
  const innerR = outerR - size * 0.18;
  const gapDeg = 2;
  let angle = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={styles.donutSvg}>
      {data.map(({ key, value, color }) => {
        const sweep = (value / total) * 360;
        const start = angle + gapDeg / 2;
        const end = angle + sweep - gapDeg / 2;
        angle += sweep;
        return (
          <path
            key={key}
            d={describeDonutSegment(center, center, outerR, innerR, start, end)}
            fill={color}
          />
        );
      })}
    </svg>
  );
}

function StatCard({ label, value, delta, deltaDirection, colorKey, icon }) {
  return (
    <article className={styles.statCard}>
      <div className={`${styles.statIcon} ${styles[colorKey]}`}>{icon}</div>
      <div className={styles.statInfo}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statValue}>{value}</span>
        <div className={styles.statFooter}>
          <span
            className={`${styles.statDelta} ${deltaDirection === 'down' ? styles.statDeltaDown : ''}`}
          >
            {delta}
          </span>
          <span className={styles.statDeltaCaption}>지난주 대비</span>
        </div>
      </div>
    </article>
  );
}

function RoleBadge({ role }) {
  return (
    <span className={`${styles.roleBadge} ${role === '관리자' ? styles.roleBadgeAdmin : ''}`}>
      {role}
    </span>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`${styles.statusBadge} ${status === '비활성' ? styles.statusBadgeInactive : ''}`}
    >
      {status}
    </span>
  );
}

function UserFormFields({ form, onChange, isEdit }) {
  return (
    <div className={styles.formGrid}>
      <div className={styles.field}>
        <label className={styles.label}>이름</label>
        <input
          className={styles.input}
          value={form.name}
          onChange={e => onChange({ ...form, name: e.target.value })}
          placeholder="이름을 입력하세요"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>이메일</label>
        <input
          className={styles.input}
          value={form.email}
          disabled={isEdit}
          onChange={e => onChange({ ...form, email: e.target.value })}
          placeholder="이메일 주소를 입력하세요"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>부서 선택</label>
        <select
          className={styles.input}
          value={form.dept}
          onChange={e => onChange({ ...form, dept: e.target.value })}
        >
          <option value="" disabled>
            부서를 선택하세요
          </option>
          {DEPARTMENTS.map(dept => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>권한 선택</label>
        <select
          className={styles.input}
          value={form.role}
          onChange={e => onChange({ ...form, role: e.target.value })}
        >
          <option value="" disabled>
            권한을 선택하세요
          </option>
          {ROLES.map(role => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      {!isEdit && (
        <div className={`${styles.field} ${styles.fieldWide}`}>
          <label className={styles.label}>초기 비밀번호</label>
          <input
            className={styles.input}
            type="text"
            value={form.password}
            onChange={e => onChange({ ...form, password: e.target.value })}
            placeholder="초기 비밀번호를 입력하세요"
          />
        </div>
      )}
    </div>
  );
}

function RegisterUserModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    dept: '',
    role: '',
    password: '',
    status: '활성',
  });

  function handleSave() {
    onSave(form);
  }

  return (
    <div className={styles.overlay} role="dialog" aria-label="사용자 등록">
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>사용자 등록</h2>
        <p className={styles.modalSubtitle}>새 사내 사용자 계정을 등록합니다.</p>

        <UserFormFields form={form} onChange={setForm} isEdit={false} />

        <div className={styles.field}>
          <label className={styles.label}>계정 상태</label>
          <div className={styles.statusCardRow}>
            {STATUSES.map(status => (
              <button
                key={status}
                type="button"
                className={`${styles.statusCard} ${form.status === status ? styles.statusCardActive : ''}`}
                onClick={() => setForm({ ...form, status })}
              >
                <span className={styles.statusCardTitle}>{status}</span>
                <span className={styles.statusCardDesc}>
                  {status === '활성'
                    ? '계정을 활성화하여 즉시 로그인할 수 있습니다.'
                    : '계정을 비활성 상태로 생성합니다.'}
                </span>
              </button>
            ))}
          </div>
          <p className={styles.helperText}>사용자는 로그인 시 초기 비밀번호를 변경해야 합니다.</p>
        </div>

        <div className={styles.modalActions}>
          <Button variant={BUTTON_VARIANTS.SECONDARY} size={BUTTON_SIZES.MEDIUM} onClick={onClose}>
            취소
          </Button>
          <Button variant={BUTTON_VARIANTS.PRIMARY} size={BUTTON_SIZES.MEDIUM} onClick={handleSave}>
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({ ...user, memo: '' });

  function handleSave() {
    onSave(form);
  }

  return (
    <div className={styles.overlay} role="dialog" aria-label="사용자 정보 수정">
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>사용자 정보 수정</h2>
        <p className={styles.modalSubtitle}>선택한 사용자 계정 정보와 권한을 변경합니다.</p>

        <UserFormFields form={form} onChange={setForm} isEdit />

        <div className={styles.field}>
          <label className={styles.label}>비밀번호 초기화</label>
          <p className={styles.helperText}>
            사용자의 비밀번호를 초기화하고, 임시 비밀번호를 이메일로 발송합니다.
          </p>
          <button
            type="button"
            className={styles.dangerButton}
            onClick={() => setForm({ ...form, passwordResetRequested: true })}
          >
            {form.passwordResetRequested ? '초기화 요청됨' : '비밀번호 초기화'}
          </button>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>관리자 참고사항</label>
          <textarea
            className={styles.textarea}
            value={form.memo}
            onChange={e => setForm({ ...form, memo: e.target.value })}
            placeholder="메모"
          />
        </div>

        <div className={styles.modalActions}>
          <Button variant={BUTTON_VARIANTS.SECONDARY} size={BUTTON_SIZES.MEDIUM} onClick={onClose}>
            취소
          </Button>
          <Button variant={BUTTON_VARIANTS.PRIMARY} size={BUTTON_SIZES.MEDIUM} onClick={handleSave}>
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}

function AdminUsersPage() {
  const user = useAuthStore(state => state.user);
  const displayName = user?.name ?? '윤정연';
  const displayDept = user ? `${user.departmentName} · ${user.roleName}` : '인사팀 · 사원';
  const avatarChar = displayName[0];

  const [users, setUsers] = useState(INITIAL_USERS);
  const [keyword, setKeyword] = useState('');
  const [deptFilter, setDeptFilter] = useState('전체');
  const [roleFilter, setRoleFilter] = useState('전체');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [editingUser, setEditingUser] = useState(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesKeyword =
        !keyword.trim() || u.name.includes(keyword.trim()) || u.email.includes(keyword.trim());
      const matchesDept = deptFilter === '전체' || u.dept === deptFilter;
      const matchesRole = roleFilter === '전체' || u.role === roleFilter;
      const matchesStatus = statusFilter === '전체' || u.status === statusFilter;
      return matchesKeyword && matchesDept && matchesRole && matchesStatus;
    });
  }, [users, keyword, deptFilter, roleFilter, statusFilter]);

  function handleResetFilters() {
    setKeyword('');
    setDeptFilter('전체');
    setRoleFilter('전체');
    setStatusFilter('전체');
  }

  function handleRegisterSave(form) {
    setUsers(prev => [
      ...prev,
      {
        id: prev.length ? Math.max(...prev.map(u => u.id)) + 1 : 1,
        name: form.name,
        email: form.email,
        dept: form.dept,
        position: '-',
        role: form.role || '사용자',
        status: form.status,
        lastLoginAt: '-',
        joinedAt: '-',
      },
    ]);
    setIsRegisterOpen(false);
  }

  function handleEditSave(form) {
    setUsers(prev => prev.map(u => (u.id === form.id ? { ...u, ...form } : u)));
    setEditingUser(null);
  }

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.searchBox}>
          <input type="text" className={styles.searchInput} placeholder="문서, 교육, 질문 검색" />
          <span className={styles.searchIcon}>
            <IconSearch />
          </span>
        </div>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{avatarChar}</div>
          <div className={styles.userText}>
            <span className={styles.userName}>{displayName}님</span>
            <span className={styles.userDept}>{displayDept}</span>
          </div>
        </div>
      </header>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>사용자 관리</h1>
        <p className={styles.pageSubtitle}>사내 사용자 계정과 권한을 조회하고 관리하세요.</p>
      </div>

      <div className={styles.statGrid}>
        {STAT_CARDS.map(({ key, ...card }) => (
          <StatCard key={key} {...card} />
        ))}
      </div>

      <section className={styles.tablePanel}>
        <div className={styles.filterRow}>
          <div className={styles.searchFieldWrap}>
            <input
              className={styles.filterInput}
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="이름 또는 이메일 검색"
            />
            <span className={styles.filterSearchIcon}>
              <IconSearch />
            </span>
          </div>

          <select
            className={styles.filterSelect}
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
          >
            <option value="전체">부서 전체</option>
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="전체">권한 전체</option>
            {ROLES.map(role => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="전체">상태 전체</option>
            {STATUSES.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <button type="button" className={styles.resetButton} onClick={handleResetFilters}>
            초기화
          </button>

          <Button
            variant={BUTTON_VARIANTS.PRIMARY}
            size={BUTTON_SIZES.MEDIUM}
            className={styles.registerButton}
            onClick={() => setIsRegisterOpen(true)}
          >
            + 사용자 등록
          </Button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.usersTable}>
            <thead>
              <tr>
                <th>이름</th>
                <th>부서</th>
                <th>직급</th>
                <th>이메일</th>
                <th>권한</th>
                <th>상태</th>
                <th>최근 로그인</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.dept}</td>
                  <td>{u.position}</td>
                  <td>{u.email}</td>
                  <td>
                    <RoleBadge role={u.role} />
                  </td>
                  <td>
                    <StatusBadge status={u.status} />
                  </td>
                  <td>{u.lastLoginAt}</td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={styles.rowActionBtn}
                        onClick={() => setEditingUser(u)}
                      >
                        수정
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <p className={styles.emptyText}>조건에 맞는 사용자가 없습니다.</p>
          )}
        </div>
      </section>

      <div className={styles.bottomGrid}>
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>부서별 사용자 현황</h2>
          <span className={styles.panelCaption}>최근 30일 기준</span>

          <ul className={styles.barList}>
            {DEPT_DISTRIBUTION.map(({ key, label, value }) => (
              <li key={key} className={styles.barItem}>
                <span className={styles.barLabel}>{label}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFillDynamic}
                    style={{ '--bar-color': '#4285F4', '--bar-percent': `${(value / 312) * 100}%` }}
                  />
                </div>
                <span className={styles.barValue}>{value}명</span>
              </li>
            ))}
          </ul>

          <div className={styles.activityBox}>
            <span className={styles.activityTitle}>최근 관리 활동</span>
            <ul className={styles.activityList}>
              {RECENT_ACTIVITY.map(({ key, label, count }) => (
                <li key={key} className={styles.activityItem}>
                  <span className={`${styles.activityDot} ${styles[`dot_${key}`]}`} />
                  <span className={styles.activityLabel}>{label}</span>
                  <span className={styles.activityCount}>{count}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.miniBarRow}>
            <div className={`${styles.miniBar} ${styles.miniBarActive}`}>활성 98.4%</div>
            <div className={`${styles.miniBar} ${styles.miniBarInactive}`}>비활성 1.6%</div>
          </div>
        </section>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>권한별 사용자 분포</h2>

          <ul className={styles.barList}>
            {ROLE_DISTRIBUTION.map(({ key, label, value, percent, color }) => (
              <li key={key} className={styles.barItem}>
                <span className={styles.barLabel}>{label}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFillDynamic}
                    style={{ '--bar-color': color, '--bar-percent': percent }}
                  />
                </div>
                <span className={styles.barValue}>{value.toLocaleString()}명</span>
                <span className={styles.barPercent}>{percent}</span>
              </li>
            ))}
          </ul>

          <div className={styles.donutWrap}>
            <DonutChart data={ROLE_DONUT_DATA} />
          </div>

          <ul className={styles.roleDescList}>
            {ROLE_DESCRIPTIONS.map(({ key, label, desc, color, bg }) => (
              <li key={key} className={styles.roleDescItem}>
                <span
                  className={styles.roleDescBadge}
                  style={{ '--role-color': color, '--role-bg': bg }}
                >
                  {label}
                </span>
                <span className={styles.roleDescText}>{desc}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {isRegisterOpen && (
        <RegisterUserModal onClose={() => setIsRegisterOpen(false)} onSave={handleRegisterSave} />
      )}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}

export default AdminUsersPage;
