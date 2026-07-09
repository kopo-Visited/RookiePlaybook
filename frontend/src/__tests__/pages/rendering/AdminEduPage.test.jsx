import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import AdminEduPage from '../../../pages/admin/AdminEduPage/AdminEduPage';

const mockEducations = [
  {
    educationId: 1,
    title: '신입사원 온보딩 교육',
    totalStages: 3,
    completedStages: 0,
    progressRate: 0,
  },
  {
    educationId: 2,
    title: '백엔드 기초 교육',
    totalStages: 2,
    completedStages: 0,
    progressRate: 0,
  },
];

const server = setupServer();
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function mockListSuccess(content = mockEducations) {
  server.use(
    http.get('/api/educations', () =>
      HttpResponse.json({
        success: true,
        message: '요청이 정상 처리되었습니다.',
        data: { content, totalPages: 1, number: 0, size: 100, totalElements: content.length },
      })
    )
  );
}

describe('AdminEduPage 렌더링', () => {
  it('페이지 제목과 탭이 렌더링된다', () => {
    // given & when
    mockListSuccess();
    render(<AdminEduPage />);

    // then
    expect(screen.getByRole('heading', { name: '교육 관리' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '교육 과정 관리' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '진도 현황' })).toBeInTheDocument();
  });

  it('교육 과정 목록이 표로 렌더링된다', async () => {
    // given & when
    mockListSuccess();
    render(<AdminEduPage />);

    // then
    expect(await screen.findByText('신입사원 온보딩 교육')).toBeInTheDocument();
    expect(screen.getByText('백엔드 기초 교육')).toBeInTheDocument();
  });

  it('과정 추가 버튼을 누르면 등록 모달이 열린다', async () => {
    // given
    mockListSuccess();
    render(<AdminEduPage />);
    await screen.findByText('신입사원 온보딩 교육');

    // when
    await userEvent.click(screen.getByRole('button', { name: '+ 과정 추가' }));

    // then
    expect(screen.getByRole('heading', { name: '교육 과정 등록' })).toBeInTheDocument();
  });

  it('진도 현황 탭을 누르면 준비 중 안내가 표시된다', async () => {
    // given
    mockListSuccess();
    render(<AdminEduPage />);

    // when
    await userEvent.click(screen.getByRole('button', { name: '진도 현황' }));

    // then
    expect(screen.getByText('진도 현황 기능은 준비 중입니다.')).toBeInTheDocument();
  });

  it('목록이 비어있으면 빈 상태 메시지가 렌더링된다', async () => {
    // given & when
    mockListSuccess([]);
    render(<AdminEduPage />);

    // then
    expect(await screen.findByText('등록된 교육 과정이 없습니다.')).toBeInTheDocument();
  });

  it('API 실패 시 에러 메시지가 렌더링된다', async () => {
    // given
    server.use(
      http.get('/api/educations', () => HttpResponse.json({ message: 'error' }, { status: 500 }))
    );

    // when
    render(<AdminEduPage />);

    // then
    expect(await screen.findByText('오류가 발생했습니다.')).toBeInTheDocument();
  });
});
