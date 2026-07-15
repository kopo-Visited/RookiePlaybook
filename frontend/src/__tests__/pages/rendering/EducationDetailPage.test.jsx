import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
        <Route path="/edu/:id/stages/:stageId" element={<div>영상 페이지로 이동됨</div>} />
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

  it('미수강이면 "수강하기" 버튼이 뜨고, 클릭 시 수강 처리 후 첫 미완료 단계로 이동한다', async () => {
    // given
    let enrolledCalled = false;
    mockSuccess({ ...mockDetail, enrolled: false });
    server.use(
      http.post('/api/educations/:id/enroll', () => {
        enrolledCalled = true;
        return HttpResponse.json({ success: true, message: '수강이 시작되었습니다.' });
      })
    );
    renderPage();

    // when
    await userEvent.click(await screen.findByRole('button', { name: '수강하기' }));

    // then — enroll 호출 + 첫 미완료 단계(stage 2) 영상으로 이동
    await waitFor(() => expect(enrolledCalled).toBe(true));
    expect(await screen.findByText('영상 페이지로 이동됨')).toBeInTheDocument();
  });

  it('수강중이면 "이어서 학습하기" 버튼이 표시된다', async () => {
    // given & when
    mockSuccess({ ...mockDetail, enrolled: true });
    renderPage();

    // then
    expect(await screen.findByRole('button', { name: '이어서 학습하기' })).toBeInTheDocument();
  });

  it('직전 단계를 완료하지 않은 단계는 잠기고 클릭해도 이동하지 않는다', async () => {
    // given — 1단계 미완료 → 2단계는 잠김
    const detail = {
      ...mockDetail,
      enrolled: true,
      stages: [
        { ...mockDetail.stages[0], isCompleted: false },
        { ...mockDetail.stages[1], isCompleted: false },
      ],
    };
    mockSuccess(detail);
    renderPage();
    await screen.findByText('회사 소개');

    // then — 2단계에 잠김 배지 표시
    expect(screen.getByText('🔒 잠김')).toBeInTheDocument();

    // when — 잠긴 2단계 클릭
    await userEvent.click(screen.getByText('정보보안 기초'));

    // then — 영상으로 이동하지 않는다
    expect(screen.queryByText('영상 페이지로 이동됨')).not.toBeInTheDocument();
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

// 이슈 #328 회귀: 수강한 적 없는 과정이 '진행중'으로 표시되던 버그
describe('EducationDetailPage 과정 상태 칩', () => {
  it('미수강(enrolled=false)이면 "진행중"이 아니라 "미수강" 칩이 표시된다', async () => {
    // given & when
    mockSuccess({ ...mockDetail, enrolled: false, isCompleted: false });
    renderPage();

    // then
    expect(await screen.findByText('미수강')).toBeInTheDocument();
    expect(screen.queryByText('진행중')).not.toBeInTheDocument();
  });

  it('수강중(enrolled=true, 미완료)이면 "진행중" 칩이 표시된다', async () => {
    // given & when
    mockSuccess({ ...mockDetail, enrolled: true, isCompleted: false });
    renderPage();

    // then
    expect(await screen.findByText('진행중')).toBeInTheDocument();
    expect(screen.queryByText('미수강')).not.toBeInTheDocument();
  });

  it('수료(isCompleted=true)면 "완료" 칩이 표시된다', async () => {
    // given — 단계 배지의 "완료"와 겹치지 않도록 모든 단계를 미완료로 둔다
    const detail = {
      ...mockDetail,
      enrolled: true,
      isCompleted: true,
      stages: mockDetail.stages.map(s => ({ ...s, isCompleted: false })),
    };
    mockSuccess(detail);
    renderPage();

    // then
    expect(await screen.findByText('완료')).toBeInTheDocument();
    expect(screen.queryByText('미수강')).not.toBeInTheDocument();
    expect(screen.queryByText('진행중')).not.toBeInTheDocument();
  });
});
