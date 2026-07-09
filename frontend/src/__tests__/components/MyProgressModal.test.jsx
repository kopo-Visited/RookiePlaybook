import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import MyProgressModal from '../../components/MyProgressModal/MyProgressModal';

const mockProgress = [
  {
    educationId: 1,
    title: '신입사원 온보딩 교육',
    progressRate: 100,
    isCompleted: true,
    completedAt: '2026-07-09T09:00:00',
  },
  {
    educationId: 2,
    title: '백엔드 기초 교육',
    progressRate: 40,
    isCompleted: false,
    completedAt: null,
  },
];

const server = setupServer();
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function mockSuccess(data = mockProgress) {
  server.use(
    http.get('/api/progress/me', () =>
      HttpResponse.json({
        success: true,
        message: '요청이 정상 처리되었습니다.',
        data,
      })
    )
  );
}

describe('MyProgressModal', () => {
  it('모달 제목이 렌더링된다', () => {
    // given & when
    mockSuccess();
    render(<MyProgressModal onClose={() => {}} />);

    // then
    expect(screen.getByRole('heading', { name: '내 학습 현황' })).toBeInTheDocument();
  });

  it('API 응답의 학습 현황 목록이 렌더링된다', async () => {
    // given & when
    mockSuccess();
    render(<MyProgressModal onClose={() => {}} />);

    // then
    expect(await screen.findByText('신입사원 온보딩 교육')).toBeInTheDocument();
    expect(screen.getByText('백엔드 기초 교육')).toBeInTheDocument();
  });

  it('진도율과 상태 칩이 표시된다', async () => {
    // given & when
    mockSuccess();
    render(<MyProgressModal onClose={() => {}} />);

    // then
    await screen.findByText('신입사원 온보딩 교육');
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText('완료')).toBeInTheDocument();
    expect(screen.getByText('진행중')).toBeInTheDocument();
  });

  it('완료한 과정은 수료일이 표시된다', async () => {
    // given & when
    mockSuccess();
    render(<MyProgressModal onClose={() => {}} />);

    // then
    await screen.findByText('신입사원 온보딩 교육');
    expect(screen.getByText('수료일 2026.07.09')).toBeInTheDocument();
  });

  it('시작한 교육이 없으면 빈 상태 메시지가 렌더링된다', async () => {
    // given & when
    mockSuccess([]);
    render(<MyProgressModal onClose={() => {}} />);

    // then
    expect(await screen.findByText('수강한 교육이 없습니다.')).toBeInTheDocument();
  });

  it('API 실패 시 에러 메시지가 렌더링된다', async () => {
    // given
    server.use(
      http.get('/api/progress/me', () => HttpResponse.json({ message: 'error' }, { status: 500 }))
    );

    // when
    render(<MyProgressModal onClose={() => {}} />);

    // then
    expect(await screen.findByText('학습 현황을 불러오지 못했습니다.')).toBeInTheDocument();
  });

  it('닫기 버튼을 누르면 onClose가 호출된다', async () => {
    // given
    mockSuccess();
    const onClose = vi.fn();
    render(<MyProgressModal onClose={onClose} />);

    // when
    await userEvent.click(screen.getByLabelText('닫기'));

    // then
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
