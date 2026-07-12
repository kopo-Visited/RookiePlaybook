import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import EducationListPage from '../../../pages/edu/EducationListPage/EducationListPage';

const mockEducations = [
  {
    educationId: 1,
    title: '신입사원 온보딩 교육',
    totalStages: 3,
    completedStages: 2,
    progressRate: 66,
    isCompleted: false,
    completedAt: null,
    enrolled: true,
  },
  {
    educationId: 2,
    title: '백엔드 기초 교육',
    totalStages: 2,
    completedStages: 2,
    progressRate: 100,
    isCompleted: true,
    completedAt: '2026-07-09T09:00:00',
    enrolled: true,
  },
];

const server = setupServer();
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function mockSuccess(content = mockEducations) {
  server.use(
    http.get('/api/educations', () =>
      HttpResponse.json({
        success: true,
        message: '요청이 정상 처리되었습니다.',
        data: {
          content,
          totalPages: 1,
          number: 0,
          size: 10,
          totalElements: content.length,
        },
      })
    )
  );
}

function renderPage() {
  render(
    <MemoryRouter>
      <EducationListPage />
    </MemoryRouter>
  );
}

describe('EducationListPage 렌더링', () => {
  it('페이지 제목과 부제목이 렌더링된다', () => {
    // given & when
    mockSuccess();
    renderPage();

    // then
    expect(screen.getByRole('heading', { name: '온보딩 교육' })).toBeInTheDocument();
    expect(
      screen.getByText('신입사원이 이수해야 할 교육 과정과 내 진도 현황을 확인하세요.')
    ).toBeInTheDocument();
  });

  it('API 응답의 교육 과정 목록이 렌더링된다', async () => {
    // given & when
    mockSuccess();
    renderPage();

    // then
    expect(await screen.findByText('신입사원 온보딩 교육')).toBeInTheDocument();
    expect(screen.getByText('백엔드 기초 교육')).toBeInTheDocument();
  });

  it('진도율과 완료 단계 수가 표시된다', async () => {
    // given & when
    mockSuccess();
    renderPage();

    // then
    await screen.findByText('신입사원 온보딩 교육');
    expect(screen.getByText('66%')).toBeInTheDocument();
    expect(screen.getByText('2/3 단계')).toBeInTheDocument();
  });

  it('완료/수강중 상태 칩이 표시된다', async () => {
    // given & when
    mockSuccess();
    renderPage();

    // then
    await screen.findByText('신입사원 온보딩 교육');
    expect(screen.getByText('수강중')).toBeInTheDocument();
    expect(screen.getByText('완료')).toBeInTheDocument();
  });

  it('수강 기록이 없으면 "미수강" 칩이 표시된다', async () => {
    // given & when
    mockSuccess([
      {
        educationId: 3,
        title: '미수강 과정',
        totalStages: 2,
        completedStages: 0,
        progressRate: 0,
        isCompleted: false,
        completedAt: null,
        enrolled: false,
      },
    ]);
    renderPage();

    // then
    expect(await screen.findByText('미수강 과정')).toBeInTheDocument();
    expect(screen.getByText('미수강')).toBeInTheDocument();
  });

  it('목록이 비어있으면 빈 상태 메시지가 렌더링된다', async () => {
    // given & when
    mockSuccess([]);
    renderPage();

    // then
    expect(await screen.findByText('등록된 교육 과정이 없습니다.')).toBeInTheDocument();
  });

  it('API 실패 시 에러 메시지가 렌더링된다', async () => {
    // given
    server.use(
      http.get('/api/educations', () => HttpResponse.json({ message: 'error' }, { status: 500 }))
    );

    // when
    renderPage();

    // then
    expect(await screen.findByText('교육 과정을 불러오지 못했습니다.')).toBeInTheDocument();
  });
});
