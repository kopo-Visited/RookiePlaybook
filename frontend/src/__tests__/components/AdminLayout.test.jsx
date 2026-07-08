import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { ROUTES } from '../../constants/routes';

function renderAdminLayout(initialPath = ROUTES.ADMIN.DASHBOARD) {
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path={ROUTES.ADMIN.DASHBOARD} element={<div>대시보드 콘텐츠</div>} />
          <Route path={ROUTES.ADMIN.USERS} element={<div>사용자 콘텐츠</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('AdminLayout', () => {
  it('로고와 7개의 메뉴 항목이 렌더링된다', () => {
    // given & when
    renderAdminLayout();

    // then
    expect(screen.getByText('신입의 정석')).toBeInTheDocument();
    [
      '관리자 대시보드',
      '사용자 관리',
      '콘텐츠 관리',
      '답변 관리',
      '교육관리',
      '문의 관리',
      '설정',
    ].forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('현재 경로와 일치하는 메뉴 항목이 활성 상태로 표시된다', () => {
    // given & when
    renderAdminLayout(ROUTES.ADMIN.USERS);

    // then
    expect(screen.getByText('사용자 콘텐츠')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /사용자 관리/ }).className).toMatch(/navItemActive/);
    expect(screen.getByRole('link', { name: /콘텐츠 관리/ }).className).not.toMatch(
      /navItemActive/
    );
  });
});
