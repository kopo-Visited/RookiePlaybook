import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import VideoPlayerPage from '../../../pages/edu/VideoPlayerPage/VideoPlayerPage';

const material = {
  materialId: 1,
  title: '회사 소개 영상',
  videoUrl: 'https://videos.example.com/a.mp4',
  lastWatchedPosition: 0,
  totalDuration: 600,
};

const detail = {
  educationId: 1,
  title: '신입사원 온보딩 교육',
  description: '',
  completionCriteria: 80,
  progressRate: 0,
  isCompleted: false,
  stages: [
    {
      stageId: 1,
      title: '회사 소개',
      description: '회사 비전 소개',
      orderNumber: 1,
      isCompleted: false,
      material,
    },
    {
      stageId: 2,
      title: '정보보안 기초',
      description: '보안 정책',
      orderNumber: 2,
      isCompleted: false,
      material,
    },
  ],
};

const server = setupServer();
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function mockSuccess() {
  server.use(
    http.get('/api/stages/:stageId/material', () =>
      HttpResponse.json({ success: true, message: '', data: material })
    ),
    http.get('/api/educations/:id', () =>
      HttpResponse.json({ success: true, message: '', data: detail })
    ),
    http.post('/api/progress/video', () => HttpResponse.json({ success: true, message: '' })),
    http.post('/api/progress/stage', () =>
      HttpResponse.json({
        success: true,
        message: '',
        data: { progressRate: 33, isCompleted: false, completedAt: null },
      })
    )
  );
}

function renderPage(stageId = 1) {
  render(
    <MemoryRouter initialEntries={[`/edu/1/stages/${stageId}`]}>
      <Routes>
        <Route path="/edu/:id/stages/:stageId" element={<VideoPlayerPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('VideoPlayerPage 렌더링', () => {
  it('과정명·영상 제목·설명이 렌더링된다', async () => {
    // given & when
    mockSuccess();
    renderPage();

    // then
    expect(await screen.findByText('[신입사원 온보딩 교육]')).toBeInTheDocument();
    expect(screen.getByText('영상 제목 : 회사 소개')).toBeInTheDocument();
    expect(screen.getByText('회사 비전 소개')).toBeInTheDocument();
  });

  it('단계 완료/이전/다음/대시보드로 버튼이 렌더링된다', async () => {
    // given & when
    mockSuccess();
    renderPage();

    // then
    await screen.findByText('[신입사원 온보딩 교육]');
    expect(screen.getByRole('button', { name: '단계 완료' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /이전 영상/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /다음 영상/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /대시보드로/ })).toBeInTheDocument();
  });

  it('첫 단계에서는 이전 영상 버튼이 비활성화된다', async () => {
    // given & when
    mockSuccess();
    renderPage(1);

    // then
    await screen.findByText('[신입사원 온보딩 교육]');
    expect(screen.getByRole('button', { name: /이전 영상/ })).toBeDisabled();
  });

  it('단계 완료 버튼 클릭 시 완료 처리되고 완료됨으로 바뀐다', async () => {
    // given
    mockSuccess();
    renderPage();
    const btn = await screen.findByRole('button', { name: '단계 완료' });

    // when
    await userEvent.click(btn);

    // then
    await waitFor(() => {
      expect(screen.getByText('단계를 완료했습니다.')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: '완료됨' })).toBeInTheDocument();
  });

  it('영상 로드 실패 시 에러 메시지가 렌더링된다', async () => {
    // given
    server.use(
      http.get('/api/stages/:stageId/material', () =>
        HttpResponse.json({ message: 'error' }, { status: 500 })
      ),
      http.get('/api/educations/:id', () =>
        HttpResponse.json({ success: true, message: '', data: detail })
      )
    );

    // when
    renderPage();

    // then
    expect(await screen.findByText('영상을 불러오지 못했습니다.')).toBeInTheDocument();
  });
});
