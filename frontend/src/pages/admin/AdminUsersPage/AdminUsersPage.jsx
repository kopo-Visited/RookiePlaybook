import { useMemo, useState } from 'react';
import styles from './AdminUsersPage.module.css';
import Button from '../../../components/Button/Button';
import Spinner from '../../../components/Spinner/Spinner';
import ErrorMessage from '../../../components/ErrorMessage/ErrorMessage';
import useAuthStore from '../../../stores/authStore';
import useAdminUsers from '../../../hooks/admin/useAdminUsers';
import { COLOR_KEYS, BUTTON_VARIANTS, BUTTON_SIZES } from '../../../constants/styles';
import { ERROR_MESSAGES } from '../../../constants/message';

const STAT_CARD_CONFIG = [
  { key: 'total', label: '전체 사용자', colorKey: COLOR_KEYS.BLUE, icon: <IconPerson /> },
  { key: 'active', label: '활성 사용자', colorKey: COLOR_KEYS.GREEN, icon: <IconDocText /> },
  { key: 'admin', label: '관리자 계정', colorKey: COLOR_KEYS.PINK, icon: <IconChatBubble /> },
  { key: 'inactive', label: '비활성 계정', colorKey: COLOR_KEYS.ORANGE, icon: <IconAcademicCap /> },
];

function buildUserStatCardValues(users) {
  const total = users.length;
  const active = users.filter(u => u.status === 'ACTIVE').length;
  const admin = users.filter(u => u.roleCode === 'ROLE_ADMIN').length;
  const inactive = total - active;
  return {
    total: { value: `${total.toLocaleString()}명` },
    active: { value: `${active.toLocaleString()}명` },
    admin: { value: `${admin.toLocaleString()}명` },
    inactive: { value: `${inactive.toLocaleString()}명` },
  };
}

function buildDeptDistribution(users) {
  const counts = new Map();
  users.forEach(u => counts.set(u.departmentName, (counts.get(u.departmentName) ?? 0) + 1));
  const max = Math.max(...counts.values(), 1);
  return Array.from(counts.entries())
    .map(([label, value]) => ({ key: label, label, value, percent: (value / max) * 100 }))
    .sort((a, b) => b.value - a.value);
}

function countRecentRegistrations(users, days = 30) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return users.filter(u => u.createdAt && new Date(u.createdAt).getTime() >= cutoff).length;
}

function buildRoleBreakdown(users) {
  const total = users.length || 1;
  const groups = [
    {
      key: 'admin',
      label: '관리자',
      match: u => u.roleCode === 'ROLE_ADMIN' && u.status === 'ACTIVE',
      color: '#4285F4',
      donutColor: '#2288FF',
    },
    {
      key: 'user',
      label: '일반 사용자',
      match: u => u.roleCode !== 'ROLE_ADMIN' && u.status === 'ACTIVE',
      color: '#9CC2FF',
      donutColor: '#60A5FA',
    },
    {
      key: 'inactive',
      label: '비활성',
      match: u => u.status !== 'ACTIVE',
      color: '#D7E7FF',
      donutColor: '#BFDBFE',
    },
  ];
  return groups.map(g => {
    const value = users.filter(g.match).length;
    return { ...g, value, percent: `${((value / total) * 100).toFixed(1)}%` };
  });
}

const STATUS_LABELS = {
  ACTIVE: '활성',
  INACTIVE: '비활성',
  DELETED: '삭제됨',
};

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: '활성', desc: '계정을 활성화하여 즉시 로그인할 수 있습니다.' },
  { value: 'INACTIVE', label: '비활성', desc: '계정을 비활성 상태로 생성합니다.' },
];

function formatDateTime(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

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
        {delta && (
          <div className={styles.statFooter}>
            <span
              className={`${styles.statDelta} ${deltaDirection === 'down' ? styles.statDeltaDown : ''}`}
            >
              {delta}
            </span>
            <span className={styles.statDeltaCaption}>지난주 대비</span>
          </div>
        )}
      </div>
    </article>
  );
}

function RoleBadge({ roleName, roleCode }) {
  return (
    <span
      className={`${styles.roleBadge} ${roleCode === 'ROLE_ADMIN' ? styles.roleBadgeAdmin : ''}`}
    >
      {roleName}
    </span>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`${styles.statusBadge} ${status !== 'ACTIVE' ? styles.statusBadgeInactive : ''}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function StatusCardSelector({ value, onChange }) {
  return (
    <div className={styles.statusCardRow}>
      {STATUS_OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          className={`${styles.statusCard} ${value === opt.value ? styles.statusCardActive : ''}`}
          onClick={() => onChange(opt.value)}
        >
          <span className={styles.statusCardTitle}>{opt.label}</span>
          <span className={styles.statusCardDesc}>{opt.desc}</span>
        </button>
      ))}
    </div>
  );
}

function UserFormFields({ form, onChange, departments, roles, isEdit }) {
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
          value={form.departmentId}
          onChange={e => onChange({ ...form, departmentId: Number(e.target.value) })}
        >
          <option value="" disabled>
            부서를 선택하세요
          </option>
          {departments.map(dept => (
            <option key={dept.departmentId} value={dept.departmentId}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>권한 선택</label>
        <select
          className={styles.input}
          value={form.roleId}
          onChange={e => onChange({ ...form, roleId: Number(e.target.value) })}
        >
          <option value="" disabled>
            권한을 선택하세요
          </option>
          {roles.map(role => (
            <option key={role.roleId} value={role.roleId}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>직급</label>
        <input
          className={styles.input}
          value={form.position}
          onChange={e => onChange({ ...form, position: e.target.value })}
          placeholder="직급을 입력하세요"
        />
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

function RegisterUserModal({ departments, roles, onClose, onSave }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    departmentId: '',
    roleId: '',
    position: '',
    password: '',
    status: 'ACTIVE',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.response?.data?.message || ERROR_MESSAGES.SERVER_ERROR);
      setSaving(false);
    }
  }

  return (
    <div className={styles.overlay} role="dialog" aria-label="사용자 등록">
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>사용자 등록</h2>
        <p className={styles.modalSubtitle}>새 사내 사용자 계정을 등록합니다.</p>

        <UserFormFields
          form={form}
          onChange={setForm}
          departments={departments}
          roles={roles}
          isEdit={false}
        />

        <div className={styles.field}>
          <label className={styles.label}>계정 상태</label>
          <StatusCardSelector
            value={form.status}
            onChange={status => setForm({ ...form, status })}
          />
          <p className={styles.helperText}>사용자는 로그인 시 초기 비밀번호를 변경해야 합니다.</p>
        </div>

        {error && <p className={styles.formError}>{error}</p>}

        <div className={styles.modalActions}>
          <Button variant={BUTTON_VARIANTS.SECONDARY} size={BUTTON_SIZES.MEDIUM} onClick={onClose}>
            취소
          </Button>
          <Button
            variant={BUTTON_VARIANTS.PRIMARY}
            size={BUTTON_SIZES.MEDIUM}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function EditUserModal({ user, departments, roles, onClose, onSave }) {
  const [form, setForm] = useState({ ...user, position: user.position || '', memo: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.response?.data?.message || ERROR_MESSAGES.SERVER_ERROR);
      setSaving(false);
    }
  }

  return (
    <div className={styles.overlay} role="dialog" aria-label="사용자 정보 수정">
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>사용자 정보 수정</h2>
        <p className={styles.modalSubtitle}>선택한 사용자 계정 정보와 권한을 변경합니다.</p>

        <UserFormFields
          form={form}
          onChange={setForm}
          departments={departments}
          roles={roles}
          isEdit
        />

        <div className={styles.field}>
          <label className={styles.label}>계정 상태</label>
          <StatusCardSelector
            value={form.status}
            onChange={status => setForm({ ...form, status })}
          />
        </div>

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

        {error && <p className={styles.formError}>{error}</p>}

        <div className={styles.modalActions}>
          <Button variant={BUTTON_VARIANTS.SECONDARY} size={BUTTON_SIZES.MEDIUM} onClick={onClose}>
            취소
          </Button>
          <Button
            variant={BUTTON_VARIANTS.PRIMARY}
            size={BUTTON_SIZES.MEDIUM}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '저장 중...' : '저장'}
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

  const {
    users,
    departments,
    roles,
    loading,
    error,
    registerUser,
    editUser,
    changeUserRole,
    changeUserStatus,
  } = useAdminUsers();

  const [keyword, setKeyword] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editingUser, setEditingUser] = useState(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const statCardValues = useMemo(() => buildUserStatCardValues(users), [users]);
  const deptDistribution = useMemo(() => buildDeptDistribution(users), [users]);
  const roleBreakdown = useMemo(() => buildRoleBreakdown(users), [users]);
  const recentRegistrations = useMemo(() => countRecentRegistrations(users), [users]);
  const activePercent = users.length
    ? (users.filter(u => u.status === 'ACTIVE').length / users.length) * 100
    : 0;

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesKeyword =
        !keyword.trim() || u.name.includes(keyword.trim()) || u.email.includes(keyword.trim());
      const matchesDept = deptFilter === 'ALL' || u.departmentId === deptFilter;
      const matchesRole = roleFilter === 'ALL' || u.roleId === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
      return matchesKeyword && matchesDept && matchesRole && matchesStatus;
    });
  }, [users, keyword, deptFilter, roleFilter, statusFilter]);

  function handleResetFilters() {
    setKeyword('');
    setDeptFilter('ALL');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
  }

  async function handleRegisterSave(form) {
    await registerUser({
      name: form.name,
      email: form.email,
      password: form.password,
      departmentId: form.departmentId,
      roleId: form.roleId,
      position: form.position,
      status: form.status,
    });
    setIsRegisterOpen(false);
  }

  async function handleEditSave(form) {
    const original = editingUser;
    const basicInfoChanged =
      form.name !== original.name ||
      form.departmentId !== original.departmentId ||
      form.position !== original.position;
    const statusChanged = form.status !== original.status;
    const roleChanged = form.roleId !== original.roleId;

    if (basicInfoChanged) {
      await editUser(form.userId, {
        name: form.name,
        departmentId: form.departmentId,
        position: form.position,
        status: form.status,
      });
    } else if (statusChanged) {
      await changeUserStatus(form.userId, form.status);
    }

    if (roleChanged) {
      await changeUserRole(form.userId, form.roleId);
    }

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
        {STAT_CARD_CONFIG.map(({ key, ...card }) => (
          <StatCard key={key} {...card} {...(statCardValues[key] ?? { value: '0명' })} />
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
            onChange={e => setDeptFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
          >
            <option value="ALL">부서 전체</option>
            {departments.map(dept => (
              <option key={dept.departmentId} value={dept.departmentId}>
                {dept.name}
              </option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
          >
            <option value="ALL">권한 전체</option>
            {roles.map(role => (
              <option key={role.roleId} value={role.roleId}>
                {role.name}
              </option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="ALL">상태 전체</option>
            {STATUS_OPTIONS.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
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
          {loading ? (
            <Spinner />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : (
            <>
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
                    <tr key={u.userId}>
                      <td>{u.name}</td>
                      <td>{u.departmentName}</td>
                      <td>{u.position || '-'}</td>
                      <td>{u.email}</td>
                      <td>
                        <RoleBadge roleName={u.roleName} roleCode={u.roleCode} />
                      </td>
                      <td>
                        <StatusBadge status={u.status} />
                      </td>
                      <td>{formatDateTime(u.lastLoginAt)}</td>
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
            </>
          )}
        </div>
      </section>

      <div className={styles.bottomGrid}>
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>부서별 사용자 현황</h2>
          <span className={styles.panelCaption}>전체 사용자 기준</span>

          {deptDistribution.length > 0 ? (
            <ul className={styles.barList}>
              {deptDistribution.map(({ key, label, value, percent }) => (
                <li key={key} className={styles.barItem}>
                  <span className={styles.barLabel}>{label}</span>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFillDynamic}
                      style={{ '--bar-color': '#4285F4', '--bar-percent': `${percent}%` }}
                    />
                  </div>
                  <span className={styles.barValue}>{value}명</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.panelCaption}>표시할 사용자가 없습니다.</p>
          )}

          <div className={styles.activityBox}>
            <span className={styles.activityTitle}>최근 관리 활동</span>
            <ul className={styles.activityList}>
              <li className={styles.activityItem}>
                <span className={`${styles.activityDot} ${styles.dot_create}`} />
                <span className={styles.activityLabel}>신규 등록 (최근 30일)</span>
                <span className={styles.activityCount}>{recentRegistrations}</span>
              </li>
            </ul>
          </div>

          <div className={styles.miniBarRow}>
            <div className={`${styles.miniBar} ${styles.miniBarActive}`}>
              활성 {activePercent.toFixed(1)}%
            </div>
            <div className={`${styles.miniBar} ${styles.miniBarInactive}`}>
              비활성 {(100 - activePercent).toFixed(1)}%
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>권한별 사용자 분포</h2>

          <ul className={styles.barList}>
            {roleBreakdown.map(({ key, label, value, percent, color }) => (
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

          {users.length > 0 ? (
            <div className={styles.donutWrap}>
              <DonutChart
                data={roleBreakdown.map(r => ({ key: r.key, value: r.value, color: r.donutColor }))}
              />
            </div>
          ) : (
            <p className={styles.panelCaption}>표시할 사용자가 없습니다.</p>
          )}

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
        <RegisterUserModal
          departments={departments}
          roles={roles}
          onClose={() => setIsRegisterOpen(false)}
          onSave={handleRegisterSave}
        />
      )}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          departments={departments}
          roles={roles}
          onClose={() => setEditingUser(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}

export default AdminUsersPage;
