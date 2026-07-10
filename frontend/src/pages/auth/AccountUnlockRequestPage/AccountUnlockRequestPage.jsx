import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './AccountUnlockRequestPage.module.css';
import Button from '../../../components/Button/Button';
import { submitAccountUnlockRequest } from '../../../api/accountUnlockApi';
import { BUTTON_VARIANTS, BUTTON_SIZES } from '../../../constants/styles';
import { ROUTES } from '../../../constants/routes';

const INITIAL_FORM = {
  name: '',
  email: '',
  employeeNo: '',
  departmentName: '',
  phone: '',
  memo: '',
};

const FIELDS = [
  { key: 'name', label: '이름', placeholder: '이름을 입력하세요' },
  { key: 'email', label: '이메일', placeholder: '가입 시 사용한 이메일을 입력하세요', type: 'email' },
  { key: 'employeeNo', label: '사번', placeholder: '사번을 입력하세요' },
  { key: 'departmentName', label: '부서', placeholder: '소속 부서를 입력하세요' },
  { key: 'phone', label: '전화번호', placeholder: "'-' 없이 숫자만 입력하세요" },
];

function AccountUnlockRequestPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  function handleChange(key) {
    return e => setForm(f => ({ ...f, [key]: e.target.value }));
  }

  const isValid = FIELDS.every(({ key }) => form[key].trim().length > 0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError('');
    try {
      await submitAccountUnlockRequest({
        ...form,
        memo: form.memo.trim() || null,
      });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || '요청 접수에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>요청이 접수되었습니다</h1>
          <p className={styles.subtitle}>
            관리자 확인 후 비밀번호가 초기화되며, 계정 잠금이 해제됩니다. 처리 결과는 별도로
            안내되지 않으니 잠시 후 초기 비밀번호로 다시 로그인해주세요.
          </p>
          <Link to={ROUTES.LOGIN} className={styles.backLink}>
            로그인 화면으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>계정 잠금해제 요청</h1>
        <p className={styles.subtitle}>
          비밀번호를 5회 이상 잘못 입력하여 계정이 잠겼습니다. 아래 정보를 입력해 관리자에게
          잠금해제를 요청하세요.
        </p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {FIELDS.map(({ key, label, placeholder, type }) => (
            <div key={key} className={styles.field}>
              <label htmlFor={key} className={styles.label}>
                {label}
              </label>
              <input
                id={key}
                type={type ?? 'text'}
                className={styles.input}
                placeholder={placeholder}
                value={form[key]}
                onChange={handleChange(key)}
              />
            </div>
          ))}

          <div className={styles.field}>
            <label htmlFor="memo" className={styles.label}>
              메모 <span className={styles.optional}>(선택)</span>
            </label>
            <textarea
              id="memo"
              className={styles.textarea}
              placeholder="관리자에게 전달할 내용이 있다면 입력하세요"
              value={form.memo}
              onChange={handleChange('memo')}
            />
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
            disabled={!isValid || submitting}
            className={styles.submitButton}
          >
            {submitting ? '요청 중...' : '잠금해제 요청하기'}
          </Button>

          <Link to={ROUTES.LOGIN} className={styles.backLink}>
            로그인 화면으로 돌아가기
          </Link>
        </form>
      </div>
    </div>
  );
}

export default AccountUnlockRequestPage;
