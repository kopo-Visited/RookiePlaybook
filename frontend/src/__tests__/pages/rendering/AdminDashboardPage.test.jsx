import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminDashboardPage from '../../../pages/admin/AdminDashboardPage/AdminDashboardPage';
import { ROUTES } from '../../../constants/routes';

function renderAdminDashboardPage() {
  render(
    <MemoryRouter>
      <AdminDashboardPage />
    </MemoryRouter>
  );
}

describe('AdminDashboardPage 렌더링', () => {
  it('페이지 제목과 부제목이 렌더링된다', () => {
    // given & when
    renderAdminDashboardPage();

    // then
    expect(screen.getByRole('heading', { name: '관리자 대시보드' })).toBeInTheDocument();
    expect(screen.getByText('진행중인 교육과 수료 현황을 관리해요')).toBeInTheDocument();
  });

  it('4개의 통계 카드가 렌더링된다', () => {
    // given & when
    renderAdminDashboardPage();

    // then
    expect(screen.getByText('전체 사용자')).toBeInTheDocument();
    expect(screen.getByText('1,248명')).toBeInTheDocument();
    expect(screen.getByText('전체 문서')).toBeInTheDocument();
    expect(screen.getByText('미답변 질문')).toBeInTheDocument();
    expect(screen.getByText('진행 중 교육')).toBeInTheDocument();
  });

  it('사용자 관리 테이블과 카테고리 분포 패널이 렌더링된다', () => {
    // given & when
    renderAdminDashboardPage();

    // then
    expect(screen.getByText('사용자 관리')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '이메일' })).toBeInTheDocument();
    expect(screen.getByText('문서 카테고리 분포')).toBeInTheDocument();
    expect(screen.getByText('교육 완료 현황')).toBeInTheDocument();
  });

  it('최근 등록 문서, 최근 질문, 운영 공지, 접속 현황 패널이 렌더링된다', () => {
    // given & when
    renderAdminDashboardPage();

    // then
    expect(screen.getByText('최근 등록 문서')).toBeInTheDocument();
    expect(screen.getByText('최근 질문 현황')).toBeInTheDocument();
    expect(screen.getByText('운영 공지')).toBeInTheDocument();
    expect(screen.getByText('접속 현황 (오늘)')).toBeInTheDocument();
    expect(screen.getByText('542명')).toBeInTheDocument();
  });

  it('전체 사용자 카드를 클릭하면 사용자 관리 화면으로 이동한다', async () => {
    // given
    render(
      <MemoryRouter initialEntries={[ROUTES.ADMIN.DASHBOARD]}>
        <Routes>
          <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboardPage />} />
          <Route path={ROUTES.ADMIN.USERS} element={<div>사용자 관리 화면</div>} />
        </Routes>
      </MemoryRouter>
    );

    // when
    await userEvent.click(screen.getByRole('button', { name: /전체 사용자/ }));

    // then
    expect(screen.getByText('사용자 관리 화면')).toBeInTheDocument();
  });
});
