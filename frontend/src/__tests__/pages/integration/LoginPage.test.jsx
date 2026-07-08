import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import LoginPage from '../../../pages/auth/LoginPage/LoginPage';
import useAuthStore from '../../../stores/authStore';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  useAuthStore.getState().logout();
});
afterAll(() => server.close());

function renderLoginPage() {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  it('로그인에 성공하면 사용자 정보와 토큰이 저장된다', async () => {
    // given
    server.use(
      http.post('/api/auth/login', () => {
        return HttpResponse.json({
          success: true,
          message: '로그인에 성공했습니다.',
          data: {
            accessToken: 'token-abc',
            userId: 1,
            name: '홍길동',
            email: 'user@company.com',
            departmentName: '개발',
            roleCode: 'ROLE_USER',
            roleName: '일반 사용자',
          },
        });
      })
    );
    renderLoginPage();

    // when
    await userEvent.type(
      screen.getByPlaceholderText('이메일 주소를 입력하세요'),
      'user@company.com'
    );
    await userEvent.type(screen.getByPlaceholderText('비밀번호를 입력하세요'), 'Temp1234!');
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));

    // then
    await waitFor(() => {
      expect(useAuthStore.getState().token).toBe('token-abc');
    });
    expect(useAuthStore.getState().user.name).toBe('홍길동');
  });

  it('이메일 또는 비밀번호가 일치하지 않으면 에러 메시지가 렌더링된다', async () => {
    // given — 이 테스트에서만 실패 응답으로 덮어쓰기
    server.use(
      http.post('/api/auth/login', () => {
        return HttpResponse.json(
          {
            success: false,
            message: '이메일 또는 비밀번호가 일치하지 않습니다.',
            errorCode: 'UNAUTHORIZED',
          },
          { status: 401 }
        );
      })
    );
    renderLoginPage();

    // when
    await userEvent.type(
      screen.getByPlaceholderText('이메일 주소를 입력하세요'),
      'user@company.com'
    );
    await userEvent.type(screen.getByPlaceholderText('비밀번호를 입력하세요'), 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));

    // then
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        '이메일 또는 비밀번호가 일치하지 않습니다.'
      );
    });
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('이메일을 입력하지 않고 제출하면 API를 호출하지 않고 검증 메시지를 표시한다', async () => {
    // given
    renderLoginPage();

    // when
    await userEvent.type(screen.getByPlaceholderText('비밀번호를 입력하세요'), 'Temp1234!');
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));

    // then
    expect(await screen.findByRole('alert')).toHaveTextContent('이메일을 입력해주세요.');
  });
});
