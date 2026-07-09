import { vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import StageManageModal from '../../components/StageManageModal/StageManageModal';

const education = { educationId: 1, title: '온보딩 교육' };

const mockStages = [
  {
    stageId: 1,
    title: '1단계 오리엔테이션',
    description: '회사 소개',
    orderNumber: 1,
    materials: [{ materialId: 10, title: '인트로 영상', videoUrl: 'https://x/a.mp4' }],
  },
  {
    stageId: 2,
    title: '2단계 개발 환경',
    description: '',
    orderNumber: 2,
    materials: [{ materialId: 11, title: '환경 설정 영상', videoUrl: 'https://x/b.mp4' }],
  },
];

const server = setupServer();
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
});
afterAll(() => server.close());

function mockDetail(stages = mockStages) {
  server.use(
    http.get('/api/educations/:id', () =>
      HttpResponse.json({
        success: true,
        message: '요청이 정상 처리되었습니다.',
        data: {
          educationId: 1,
          title: '온보딩 교육',
          description: '',
          completionCriteria: 80,
          progressRate: 0,
          stages,
        },
      })
    )
  );
}

function renderModal() {
  render(<StageManageModal education={education} onClose={() => {}} />);
}

describe('StageManageModal', () => {
  it('모달 제목과 과정명이 렌더링된다', () => {
    // given & when
    mockDetail();
    renderModal();

    // then
    expect(screen.getByRole('heading', { name: '단계 관리' })).toBeInTheDocument();
    expect(screen.getByText('온보딩 교육')).toBeInTheDocument();
  });

  it('단계 목록이 렌더링된다', async () => {
    // given & when
    mockDetail();
    renderModal();

    // then
    expect(await screen.findByText('1단계 오리엔테이션')).toBeInTheDocument();
    expect(screen.getByText('2단계 개발 환경')).toBeInTheDocument();
  });

  it('단계 추가 버튼을 누르면 등록 폼이 열린다', async () => {
    // given
    mockDetail();
    renderModal();
    await screen.findByText('1단계 오리엔테이션');

    // when
    await userEvent.click(screen.getByRole('button', { name: '+ 단계 추가' }));

    // then
    expect(screen.getByRole('heading', { name: '단계 등록' })).toBeInTheDocument();
    expect(screen.getByText('영상 URL')).toBeInTheDocument();
  });

  it('단계가 없으면 빈 상태 메시지가 렌더링된다', async () => {
    // given & when
    mockDetail([]);
    renderModal();

    // then
    expect(await screen.findByText('등록된 단계가 없습니다.')).toBeInTheDocument();
  });

  it('단계 등록 폼을 작성해 저장하면 등록 API가 호출된다', async () => {
    // given
    mockDetail();
    let createdBody = null;
    server.use(
      http.post('/api/admin/stages', async ({ request }) => {
        createdBody = await request.json();
        return HttpResponse.json({
          success: true,
          message: '단계가 등록되었습니다.',
          data: { stageId: 3, title: '3단계 실습' },
        });
      })
    );
    renderModal();
    await screen.findByText('1단계 오리엔테이션');
    await userEvent.click(screen.getByRole('button', { name: '+ 단계 추가' }));

    // when — 순서는 stages.length + 1로 자동 채워지므로 나머지 필수값만 입력
    await userEvent.type(
      screen.getByPlaceholderText('단계명을 입력하세요 (최대 100자)'),
      '3단계 실습'
    );
    await userEvent.type(screen.getByPlaceholderText('영상 제목을 입력하세요'), '실습 영상');
    await userEvent.type(
      screen.getByPlaceholderText('mp4 등 재생 가능한 영상 파일 URL'),
      'https://x/c.mp4'
    );
    await userEvent.click(screen.getByRole('button', { name: '저장' }));

    // then
    await waitFor(() =>
      expect(createdBody).toMatchObject({
        educationId: 1,
        title: '3단계 실습',
        orderNumber: 3,
        videoTitle: '실습 영상',
        videoUrl: 'https://x/c.mp4',
      })
    );
  });

  it('삭제 확인 시 삭제 API가 호출된다', async () => {
    // given
    mockDetail();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    let deleteCalled = false;
    server.use(
      http.delete('/api/admin/stages/1', () => {
        deleteCalled = true;
        return HttpResponse.json({ success: true, message: '단계가 삭제되었습니다.' });
      })
    );
    renderModal();
    await screen.findByText('1단계 오리엔테이션');

    // when
    await userEvent.click(screen.getAllByRole('button', { name: '삭제' })[0]);

    // then
    await waitFor(() => expect(deleteCalled).toBe(true));
  });
});
