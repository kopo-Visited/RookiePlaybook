import { useState } from 'react';
import styles from './LoginPage.module.css';
import Button from '../../../components/Button/Button';
import useLogin from '../../../hooks/auth/useLogin';
import { BUTTON_VARIANTS, BUTTON_SIZES } from '../../../constants/styles';
import heroImg from '../../../assets/hero.png';

const FEATURES = [
  {
    key: 'doc',
    title: '지식 문서 관리',
    desc: '업무 가이드, 매뉴얼, FAQ 등 사내 지식을 체계적으로 관리',
    icon: <IconBook />,
  },
  {
    key: 'edu',
    title: '온보딩 교육',
    desc: '신입 맞춤 교육 과정으로 빠른 적응을 지원',
    icon: <IconGraduate />,
  },
  {
    key: 'progress',
    title: '학습 현황 분석',
    desc: '학습 진행률과 참여도를 한눈에 확인',
    icon: <IconChart />,
  },
];

function IconBook() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 2h9l5 5v15a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M14 2v5h5M8 12h8M8 16h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconGraduate() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L2 7l10 5 10-5-10-5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M6 10v5c0 2.21 2.69 4 6 4s6-1.79 6-4v-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChart() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 20V10M12 20V4M20 20v-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2l8 3.5v6c0 5-3.4 8.7-8 10.5-4.6-1.8-8-5.5-8-10.5v-6L12 2z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconAlertCircle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16.2" r="1" fill="currentColor" />
    </svg>
  );
}

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

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useLogin();

  function handleSubmit(e) {
    e.preventDefault();
    login({ email, password });
  }

  return (
    <div className={styles.page}>
      <section className={styles.brandPanel}>
        <div className={styles.brandHeader}>
          <p className={styles.brandTagline}>사내 지식 공유 및 온보딩 교육 플랫폼</p>
          <h1 className={styles.brandTitle}>신입의 정석</h1>
        </div>

        <img src={heroImg} alt="" className={styles.brandImage} />

        <div className={styles.featureSection}>
          <h2 className={styles.featureSectionTitle}>주요 기능</h2>
          <div className={styles.featureGrid}>
            {FEATURES.map(({ key, title, desc, icon }) => (
              <div key={key} className={styles.featureCard}>
                <div className={styles.featureIcon}>{icon}</div>
                <span className={styles.featureCardTitle}>{title}</span>
                <p className={styles.featureCardDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.securityBanner}>
          <div className={styles.securityIcon}>
            <IconShield />
          </div>
          <div>
            <h3 className={styles.securityTitle}>보안 안내</h3>
            <p className={styles.securityDesc}>
              이 서비스는 회사 SSO와 보안 정책에 따라 보호됩니다. 비밀번호는 주기적으로 변경해
              주시고, 타인과 절대 공유하지 마세요.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.loginPanel}>
        <div className={styles.loginCard}>
          <h2 className={styles.loginTitle}>로그인</h2>
          <p className={styles.loginSubtitle}>계정으로 로그인하여 서비스를 이용하세요.</p>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                이메일
              </label>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="이메일 주소를 입력하세요"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>
                비밀번호
              </label>
              <div className={styles.passwordWrap}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
                >
                  <IconEye hidden={showPassword} />
                </button>
              </div>
            </div>

            <div className={styles.optionsRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
                <span className={styles.checkboxBox} />
                로그인 상태 유지
              </label>
            </div>

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
              {loading ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          <div className={styles.adminNotice}>
            <span className={styles.adminNoticeIcon}>
              <IconAlertCircle />
            </span>
            <p className={styles.adminNoticeText}>
              계정은 관리자에 의해 생성되며, 초기 비밀번호는 관리자가 안내해 드립니다. 문제가 있을
              경우 관리자에게 문의하세요.
            </p>
          </div>

          <div className={styles.linkRow}>
            <span className={styles.link}>비밀번호 재설정 요청</span>
            <span className={styles.link}>관리자에게 문의하기</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LoginPage;
