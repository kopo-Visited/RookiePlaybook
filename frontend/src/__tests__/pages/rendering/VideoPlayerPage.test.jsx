import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

// jsdom은 미디어를 실제 로드하지 않으므로, video의 currentTime/duration을 스텁으로 심어
// loadedmetadata 시 첫 프레임 이동 로직(설정된 currentTime 값)을 관찰한다.
function stubVideoTime(video, { duration = 30 } = {}) {
  let pos = 0;
  Object.defineProperty(video, 'currentTime', {
    configurable: true,
    get: () => pos,
    set: v => {
      pos = v;
    },
  });
  Object.defineProperty(video, 'duration', { configurable: true, get: () => duration });
}

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
    http.post('/api/educations/:id/enroll', () =>
      HttpResponse.json({ success: true, message: '' })
    ),
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
    expect(screen.getByText(/영상 제목 : 회사 소개/)).toBeInTheDocument();
    expect(screen.getByText('회사 비전 소개')).toBeInTheDocument();
  });

  it('영상 제목 옆에 현재/전체 단계가 표시된다', async () => {
    // given & when — 전체 2단계 중 1단계
    mockSuccess();
    renderPage(1);

    // then
    await screen.findByText('[신입사원 온보딩 교육]');
    expect(screen.getByText(/\(1\/2단계\)/)).toBeInTheDocument();
  });

  it('두 번째 단계에서는 (2/2단계)로 표시된다', async () => {
    // given & when
    mockSuccess();
    renderPage(2);

    // then
    await screen.findByText('[신입사원 온보딩 교육]');
    expect(screen.getByText(/\(2\/2단계\)/)).toBeInTheDocument();
  });

  it('단계 완료/이전/다음/목록으로 버튼이 렌더링된다', async () => {
    // given & when
    mockSuccess();
    renderPage();

    // then
    await screen.findByText('[신입사원 온보딩 교육]');
    expect(screen.getByRole('button', { name: '단계 완료' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /이전 영상/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /다음 영상/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /목록으로/ })).toBeInTheDocument();
  });

  it('목록으로 버튼 클릭 시 교육 상세(/edu/:id)로 이동한다', async () => {
    // given
    mockSuccess();
    render(
      <MemoryRouter initialEntries={['/edu/1/stages/1']}>
        <Routes>
          <Route path="/edu/:id/stages/:stageId" element={<VideoPlayerPage />} />
          <Route path="/edu/:id" element={<div>교육 상세 페이지</div>} />
        </Routes>
      </MemoryRouter>
    );
    const btn = await screen.findByRole('button', { name: /목록으로/ });

    // when
    await userEvent.click(btn);

    // then
    expect(await screen.findByText('교육 상세 페이지')).toBeInTheDocument();
  });

  it('첫 단계에서는 이전 영상 버튼이 비활성화된다', async () => {
    // given & when
    mockSuccess();
    renderPage(1);

    // then
    await screen.findByText('[신입사원 온보딩 교육]');
    expect(screen.getByRole('button', { name: /이전 영상/ })).toBeDisabled();
  });

  it('영상을 충분히 시청하기 전에는 단계 완료 버튼이 비활성화된다', async () => {
    // given & when
    mockSuccess();
    renderPage();

    // then
    await screen.findByText('[신입사원 온보딩 교육]');
    expect(screen.getByRole('button', { name: '단계 완료' })).toBeDisabled();
  });

  it('영상을 95% 이상 시청하면 단계 완료 버튼이 활성화된다', async () => {
    // given
    mockSuccess();
    renderPage();
    await screen.findByText('[신입사원 온보딩 교육]');
    const video = document.querySelector('video');
    stubVideoTime(video, { duration: 30 });
    expect(screen.getByRole('button', { name: '단계 완료' })).toBeDisabled();

    // when — 96% 지점까지 재생
    video.currentTime = 29;
    fireEvent.timeUpdate(video);

    // then
    expect(screen.getByRole('button', { name: '단계 완료' })).toBeEnabled();
  });

  it('이어보기 위치가 이미 95% 이상이면 단계 완료 버튼이 바로 활성화된다', async () => {
    // given
    const resumeMaterial = { ...material, lastWatchedPosition: 590, totalDuration: 600 };
    server.use(
      http.get('/api/stages/:stageId/material', () =>
        HttpResponse.json({ success: true, message: '', data: resumeMaterial })
      ),
      http.get('/api/educations/:id', () =>
        HttpResponse.json({ success: true, message: '', data: detail })
      )
    );

    // when
    renderPage();

    // then — 자료 로드 후 effect로 watched가 설정되므로 waitFor로 반영을 기다린다
    await screen.findByText('[신입사원 온보딩 교육]');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '단계 완료' })).toBeEnabled();
    });
  });

  it('영상을 95% 이상 시청한 뒤 단계 완료 버튼 클릭 시 완료 처리된다', async () => {
    // given
    mockSuccess();
    renderPage();
    await screen.findByText('[신입사원 온보딩 교육]');
    const video = document.querySelector('video');
    stubVideoTime(video, { duration: 30 });
    video.currentTime = 29;
    fireEvent.timeUpdate(video);
    const btn = screen.getByRole('button', { name: '단계 완료' });

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

  it('video에 preload="metadata"가 설정된다', async () => {
    // given & when
    mockSuccess();
    renderPage();

    // then
    await screen.findByText('[신입사원 온보딩 교육]');
    expect(document.querySelector('video')).toHaveAttribute('preload', 'metadata');
  });

  it('이어보기 위치가 없으면 첫 프레임을 미디어 프래그먼트(#t=0.1)로 표시한다', async () => {
    // given & when
    mockSuccess();
    renderPage();

    // then — JS seek 대신 src 프래그먼트로 첫 프레임을 표시(재생 첫 클릭과 경쟁하지 않도록)
    await screen.findByText('[신입사원 온보딩 교육]');
    const video = document.querySelector('video');
    expect(video.getAttribute('src')).toContain('#t=0.1');
  });

  it('이어보기 위치가 있으면 첫 프레임으로 이동하지 않고 저장 위치로 복원한다', async () => {
    // given
    const resumeMaterial = { ...material, lastWatchedPosition: 15 };
    server.use(
      http.get('/api/stages/:stageId/material', () =>
        HttpResponse.json({ success: true, message: '', data: resumeMaterial })
      ),
      http.get('/api/educations/:id', () =>
        HttpResponse.json({ success: true, message: '', data: detail })
      )
    );
    renderPage();
    await screen.findByText('[신입사원 온보딩 교육]');
    const video = document.querySelector('video');
    stubVideoTime(video);

    // when
    fireEvent.loadedMetadata(video);

    // then — 첫 프레임(0.1)이 아니라 이어보기 위치(15초)로 복원되고, src에 프래그먼트가 없다
    expect(video.currentTime).toBe(15);
    expect(video.getAttribute('src')).not.toContain('#t=');
  });

  it('영상 진입 시 수강(enroll)을 멱등 호출한다 (안전망)', async () => {
    // given
    let enrollCalled = false;
    server.use(
      http.get('/api/stages/:stageId/material', () =>
        HttpResponse.json({ success: true, message: '', data: material })
      ),
      http.get('/api/educations/:id', () =>
        HttpResponse.json({ success: true, message: '', data: detail })
      ),
      http.post('/api/educations/:id/enroll', () => {
        enrollCalled = true;
        return HttpResponse.json({ success: true, message: '' });
      })
    );

    // when
    renderPage();
    await screen.findByText('[신입사원 온보딩 교육]');

    // then
    await waitFor(() => expect(enrollCalled).toBe(true));
  });

  it('현재 영상 미시청 시 다음 영상 버튼이 비활성화된다', async () => {
    // given & when — 다음 단계(stage 2)가 존재하는 첫 단계
    mockSuccess();
    renderPage(1);

    // then
    await screen.findByText('[신입사원 온보딩 교육]');
    expect(screen.getByRole('button', { name: /다음 영상/ })).toBeDisabled();
  });

  it('현재 영상을 95% 이상 시청하면 다음 영상 버튼이 활성화된다', async () => {
    // given
    mockSuccess();
    renderPage(1);
    await screen.findByText('[신입사원 온보딩 교육]');
    const video = document.querySelector('video');
    stubVideoTime(video, { duration: 30 });
    expect(screen.getByRole('button', { name: /다음 영상/ })).toBeDisabled();

    // when — 96% 지점까지 재생
    video.currentTime = 29;
    fireEvent.timeUpdate(video);

    // then
    expect(screen.getByRole('button', { name: /다음 영상/ })).toBeEnabled();
  });

  it('과정을 이미 수료한 사용자는 미시청이어도 다음 영상 버튼이 활성화된다', async () => {
    // given — 과정 수료(detail.isCompleted=true)
    server.use(
      http.get('/api/stages/:stageId/material', () =>
        HttpResponse.json({ success: true, message: '', data: material })
      ),
      http.get('/api/educations/:id', () =>
        HttpResponse.json({ success: true, message: '', data: { ...detail, isCompleted: true } })
      )
    );

    // when
    renderPage(1);

    // then
    await screen.findByText('[신입사원 온보딩 교육]');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /다음 영상/ })).toBeEnabled();
    });
  });

  it('첫 단계가 아니면 미시청이어도 이전 영상 버튼은 활성화된다', async () => {
    // given & when — 이전 단계(stage 1)가 존재하는 두 번째 단계
    mockSuccess();
    renderPage(2);

    // then
    await screen.findByText('[신입사원 온보딩 교육]');
    expect(screen.getByRole('button', { name: /이전 영상/ })).toBeEnabled();
  });
});
