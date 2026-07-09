import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import EducationDetailPage from '../../../pages/edu/EducationDetailPage/EducationDetailPage';

const mockDetail = {
  educationId: 1,
  title: '신입사원 온보딩 교육',
  description: '신입사원이 반드시 이수해야 하는 기본 온보딩 과정',
  completionCriteria: 80,
  progressRate: 66,
  isCompleted: false,
  stages: [
    {
      stageId: 1,
      title: '회사 소개',
      description: '회사 비전과 조직 구조 소개',
      orderNumber: 1,
      isCompleted: true,
      material: {
        materialId: 1,
        title: '회사 소개 영상',
        videoUrl: 'https://x',
        lastWatchedPosition: 0,
      },
    },
    {
      stageId: 2,
      title: '정보보안 기초',
      description: '기본 보안 수칙과 사내 정책',
      orderNumber: 2,
      isCompleted: false,
      material: {
        materialId: 2,
        title: '정보보안 강의',
        videoUrl: 'https://y',
        lastWatchedPosition: 0,
      },
    },
  ],
};

const server = setupServer();
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function mockSuccess(detail = mockDetail) {
  server.use(
    http.get('/api/educations/:id', () =>
      HttpResponse.json({ success: true, message: '요청이 정상 처리되었습니다.', data: detail })
    )
  );
}

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/edu/1']}>
      <Routes>
        <Route path="/edu/:id" element={<EducationDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('EducationDetailPage 렌더링', () => {
  it('뒤로가기 버튼이 렌더링된다', () => {
    // given & when
    mockSuccess();
    renderPage();

    // then
    expect(screen.getByRole('button', { name: '목록으로' })).toBeInTheDocument();
  });

  it('과정 제목·설명·수료 기준이 렌더링된다', async () => {
    // given & when
    mockSuccess();
    renderPage();

    // then
    expect(
      await screen.findByRole('heading', { name: '신입사원 온보딩 교육' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('신입사원이 반드시 이수해야 하는 기본 온보딩 과정')
    ).toBeInTheDocument();
    expect(screen.getByText('수료 기준 80%')).toBeInTheDocument();
  });

  it('전체 진도율이 표시된다', async () => {
    // given & when
    mockSuccess();
    renderPage();

    // then
    expect(await screen.findByText('66%')).toBeInTheDocument();
  });

  it('단계 목록과 단계별 완료 여부가 렌더링된다', async () => {
    // given & when
    mockSuccess();
    renderPage();

    // then
    expect(await screen.findByText('회사 소개')).toBeInTheDocument();
    expect(screen.getByText('정보보안 기초')).toBeInTheDocument();
    expect(screen.getByText('완료')).toBeInTheDocument();
    expect(screen.getByText('미완료')).toBeInTheDocument();
  });

  it('API 실패 시 에러 메시지가 렌더링된다', async () => {
    // given
    server.use(
      http.get('/api/educations/:id', () =>
        HttpResponse.json({ message: 'error' }, { status: 500 })
      )
    );

    // when
    renderPage();

    // then
    expect(await screen.findByText('교육 과정을 불러오지 못했습니다.')).toBeInTheDocument();
  });
});
