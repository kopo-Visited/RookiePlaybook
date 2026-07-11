import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import AdminDashboardPage from '../../../pages/admin/AdminDashboardPage/AdminDashboardPage';
import { ROUTES } from '../../../constants/routes';

const mockStats = {
  totalUsers: 1248,
  userGrowthRatePercent: 3.2,
  totalDocuments: 356,
  documentGrowthRatePercent: -1.5,
  unansweredQuestions: 7,
  documentCategoryDistribution: [
    { categoryName: '개발', count: 120 },
    { categoryName: '인프라', count: 80 },
  ],
  accessTrend: Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: hour === 9 ? 320 : hour === 14 ? 222 : 0,
  })),
  recentUsers: [
    {
      userId: 1,
      name: '이00',
      departmentName: '개발팀',
      position: '대리',
      email: 'user1@company.com',
      status: 'ACTIVE',
      createdAt: '2026-07-01T00:00:00',
    },
  ],
  recentDocuments: [
    { id: 1, title: 'VPN 접속 가이드', categoryName: '인프라', createdAt: '2026-07-01T00:00:00' },
  ],
  recentQuestions: [
    {
      id: 1,
      title: 'VPN 연결 오류 문의',
      departmentName: '개발팀',
      createdAt: '2026-07-01T00:00:00',
    },
  ],
};

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// 진도 조회 API: 전체=10건, 완료(isCompleted=true)=6건 → 완료율 60%
function mockEduProgress({ total = 10, completed = 6 } = {}) {
  return http.get('/api/admin/progress', ({ request }) => {
    const isCompleted = new URL(request.url).searchParams.get('isCompleted');
    const totalElements = isCompleted === 'true' ? completed : total;
    return HttpResponse.json({
      success: true,
      message: '',
      data: { content: [], totalElements, totalPages: 1, size: 1, number: 0 },
    });
  });
}

function mockStatsSuccess() {
  server.use(
    http.get('/api/admin/dashboard/stats', () =>
      HttpResponse.json({ success: true, message: '', data: mockStats })
    ),
    mockEduProgress()
  );
}

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
    mockStatsSuccess();
    renderAdminDashboardPage();

    // then
    expect(screen.getByRole('heading', { name: '관리자 대시보드' })).toBeInTheDocument();
    expect(screen.getByText('진행중인 교육과 수료 현황을 관리해요')).toBeInTheDocument();
  });

  it('4개의 통계 카드가 렌더링된다', async () => {
    // given & when
    mockStatsSuccess();
    renderAdminDashboardPage();

    // then
    expect(screen.getByText('전체 사용자')).toBeInTheDocument();
    expect(await screen.findByText('1,248명')).toBeInTheDocument();
    expect(screen.getByText('전체 문서')).toBeInTheDocument();
    expect(screen.getByText('미답변 질문')).toBeInTheDocument();
    expect(screen.getByText('진행 중 교육')).toBeInTheDocument();
  });

  it('사용자 관리 테이블과 카테고리 분포 패널이 렌더링된다', async () => {
    // given & when
    mockStatsSuccess();
    renderAdminDashboardPage();

    // then
    expect(screen.getByText('사용자 관리')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '이메일' })).toBeInTheDocument();
    expect(screen.getByText('문서 카테고리 분포')).toBeInTheDocument();
    expect(screen.getByText('교육 완료 현황')).toBeInTheDocument();
    await screen.findByText('user1@company.com');
  });

  it('교육 완료 현황 패널에 완료율과 완료/미완료 인원이 표시된다', async () => {
    // given & when
    mockStatsSuccess();
    renderAdminDashboardPage();

    // then — 전체 10건 중 완료 6건 → 완료율 60%, 미완료 4명
    expect(await screen.findByText('완료 (완료율 60%)')).toBeInTheDocument();
    expect(screen.getByText('6명')).toBeInTheDocument();
    expect(screen.getByText('4명')).toBeInTheDocument();
  });

  it('최근 등록 문서, 최근 질문, 운영 공지, 접속 현황 패널이 렌더링된다', async () => {
    // given & when
    mockStatsSuccess();
    renderAdminDashboardPage();

    // then
    expect(screen.getByText('최근 등록 문서')).toBeInTheDocument();
    expect(screen.getByText('최근 질문 현황')).toBeInTheDocument();
    expect(screen.getByText('운영 공지')).toBeInTheDocument();
    expect(screen.getByText('접속 현황 (최근 로그인 기준)')).toBeInTheDocument();
    expect(await screen.findByText('542명')).toBeInTheDocument();
  });

  it('전체 사용자 카드를 클릭하면 사용자 관리 화면으로 이동한다', async () => {
    // given
    mockStatsSuccess();
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
