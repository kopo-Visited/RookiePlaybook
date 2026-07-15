import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import ChangePasswordPage from '../../../pages/auth/ChangePasswordPage/ChangePasswordPage';
import useAuthStore from '../../../stores/authStore';
import { ROUTES } from '../../../constants/routes';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  useAuthStore.getState().logout();
});
afterAll(() => server.close());

function renderChangePasswordPage() {
  render(
    <MemoryRouter initialEntries={[ROUTES.CHANGE_PASSWORD]}>
      <Routes>
        <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePasswordPage />} />
        <Route path={ROUTES.DASHBOARD} element={<div>대시보드 콘텐츠</div>} />
        <Route path={ROUTES.ADMIN.DASHBOARD} element={<div>관리자 대시보드 콘텐츠</div>} />
        <Route path={ROUTES.DOC.LIST} element={<div>지식문서 콘텐츠</div>} />
      </Routes>
    </MemoryRouter>
  );
}

async function submitPasswordChange() {
  await userEvent.type(screen.getByLabelText('현재 비밀번호'), '0000');
  await userEvent.type(screen.getByLabelText('새 비밀번호'), 'NewPass1234!');
  await userEvent.type(screen.getByLabelText('새 비밀번호 확인'), 'NewPass1234!');
  await userEvent.click(screen.getByRole('button', { name: '비밀번호 변경' }));
}

describe('ChangePasswordPage', () => {
  it('일반 사용자는 비밀번호 변경 완료 후 대시보드로 이동한다', async () => {
    // given
    useAuthStore.getState().login({ userId: 1, roleCode: 'ROLE_USER' }, 'token-abc');
    server.use(
      http.patch('/api/users/me/password', () =>
        HttpResponse.json({ success: true, message: '', data: null })
      )
    );
    renderChangePasswordPage();

    // when
    await submitPasswordChange();

    // then
    expect(await screen.findByText('대시보드 콘텐츠')).toBeInTheDocument();
    expect(screen.queryByText('지식문서 콘텐츠')).not.toBeInTheDocument();
  });

  it('관리자는 비밀번호 변경 완료 후 관리자 대시보드로 이동한다', async () => {
    // given
    useAuthStore.getState().login({ userId: 2, roleCode: 'ROLE_ADMIN' }, 'token-admin');
    server.use(
      http.patch('/api/users/me/password', () =>
        HttpResponse.json({ success: true, message: '', data: null })
      )
    );
    renderChangePasswordPage();

    // when
    await submitPasswordChange();

    // then
    expect(await screen.findByText('관리자 대시보드 콘텐츠')).toBeInTheDocument();
  });
});
