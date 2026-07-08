import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../../../pages/auth/LoginPage/LoginPage';

function renderLoginPage() {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

describe('LoginPage 렌더링', () => {
  it('로그인 제목이 렌더링된다', () => {
    // given & when
    renderLoginPage();

    // then
    expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument();
  });

  it('이메일과 비밀번호 입력창이 렌더링된다', () => {
    // given & when
    renderLoginPage();

    // then
    expect(screen.getByPlaceholderText('이메일 주소를 입력하세요')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('비밀번호를 입력하세요')).toBeInTheDocument();
  });

  it('로그인 버튼이 렌더링된다', () => {
    // given & when
    renderLoginPage();

    // then
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
  });
});
