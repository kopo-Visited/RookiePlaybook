import { useState } from 'react';
import styles from './ChangePasswordPage.module.css';
import Button from '../../../components/Button/Button';
import useChangePassword from '../../../hooks/auth/useChangePassword';
import { BUTTON_VARIANTS, BUTTON_SIZES } from '../../../constants/styles';

function IconEye({ hidden }) {
  if (hidden) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 3l18 18M10.6 10.6a3 3 0 004.24 4.24M9.3 5.4A10.9 10.9 0 0112 5c5 0 9 4 10 7-1 2-2.66 4.14-4.83 5.42M6.5 6.87C4.6 8.16 3.16 10 2 12c1 3 5 7 10 7 1.03 0 2.02-.16 2.94-.46"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M2 12c1-3 5-7 10-7s9 4 10 7c-1 3-5 7-10 7s-9-4-10-7z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function PasswordField({ id, label, value, onChange, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.passwordWrap}>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={styles.input}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className={styles.eyeButton}
          onClick={() => setVisible(v => !v)}
          aria-label={visible ? '비밀번호 숨기기' : '비밀번호 표시'}
        >
          <IconEye hidden={visible} />
        </button>
      </div>
    </div>
  );
}

function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { changePassword, loading, error } = useChangePassword();

  function handleSubmit(e) {
    e.preventDefault();
    changePassword({ currentPassword, newPassword, confirmPassword });
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>비밀번호 변경</h1>
        <p className={styles.subtitle}>
          초기 비밀번호로 로그인하셨습니다. 계정 보호를 위해 비밀번호를 변경해주세요.
        </p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <PasswordField
            id="currentPassword"
            label="현재 비밀번호"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
          <PasswordField
            id="newPassword"
            label="새 비밀번호"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
          <PasswordField
            id="confirmPassword"
            label="새 비밀번호 확인"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />

          {error && (
            <p className={styles.formError} role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant={BUTTON_VARIANTS.PRIMARY}
            size={BUTTON_SIZES.LARGE}
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? '변경 중...' : '비밀번호 변경'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordPage;
