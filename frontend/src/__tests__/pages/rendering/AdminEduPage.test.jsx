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

const mockDepartments = [
  { departmentId: 1, name: '개발팀' },
  { departmentId: 2, name: '기획팀' },
];

const mockProgress = [
  {
    userId: 1,
    userName: '김신입',
    departmentName: '개발팀',
    educationTitle: '신입사원 온보딩 교육',
    progressRate: 66,
    isCompleted: false,
    lastStudiedAt: '2026-07-01T09:00:00Z',
  },
  {
    userId: 2,
    userName: '이사원',
    departmentName: '기획팀',
    educationTitle: '백엔드 기초 교육',
    progressRate: 100,
    isCompleted: true,
    lastStudiedAt: '2026-07-05T09:00:00Z',
  },
];

const mockIncomplete = [
  {
    userId: 3,
    userName: '박미완',
    departmentName: '개발팀',
    educationTitle: '신입사원 온보딩 교육',
    progressRate: 40,
    completionCriteria: 80,
  },
];

const server = setupServer();
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function apiOk(data) {
  return HttpResponse.json({ success: true, message: '요청이 정상 처리되었습니다.', data });
}

function mockListSuccess(content = mockEducations) {
  server.use(
    http.get('/api/educations', () =>
      apiOk({ content, totalPages: 1, number: 0, size: 100, totalElements: content.length })
    )
  );
}

// 학습 현황 탭(진도 현황/미완료자)이 마운트 시 호출하는 API를 모킹한다
function mockProgressSuccess(progress = mockProgress, incomplete = mockIncomplete) {
  server.use(
    http.get('/api/departments', () => apiOk(mockDepartments)),
    http.get('/api/admin/progress', () => apiOk({ content: progress, totalPages: 1 })),
    http.get('/api/admin/progress/incomplete', () => apiOk({ content: incomplete, totalPages: 1 }))
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
    expect(screen.getByRole('button', { name: '학습 현황' })).toBeInTheDocument();
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

  it('학습 현황 탭을 누르면 진도 현황 표가 렌더링된다', async () => {
    // given
    mockListSuccess();
    mockProgressSuccess();
    render(<AdminEduPage />);

    // when
    await userEvent.click(screen.getByRole('button', { name: '학습 현황' }));

    // then
    expect(await screen.findByText('김신입')).toBeInTheDocument();
    expect(screen.getByText('이사원')).toBeInTheDocument();
  });

  it('학습 현황 탭에 진도 현황·미완료자 세그먼트가 있다', async () => {
    // given
    mockListSuccess();
    mockProgressSuccess();
    render(<AdminEduPage />);

    // when
    await userEvent.click(screen.getByRole('button', { name: '학습 현황' }));

    // then
    expect(await screen.findByText('김신입')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '진도 현황' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '미완료자' })).toBeInTheDocument();
  });

  it('미완료자 세그먼트로 전환하면 미완료자 목록이 렌더링된다', async () => {
    // given
    mockListSuccess();
    mockProgressSuccess();
    render(<AdminEduPage />);
    await userEvent.click(screen.getByRole('button', { name: '학습 현황' }));
    await screen.findByText('김신입');

    // when
    await userEvent.click(screen.getByRole('button', { name: '미완료자' }));

    // then
    expect(await screen.findByText('박미완')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('진도 현황이 비어있으면 빈 상태 메시지가 렌더링된다', async () => {
    // given
    mockListSuccess();
    mockProgressSuccess([]);
    render(<AdminEduPage />);

    // when
    await userEvent.click(screen.getByRole('button', { name: '학습 현황' }));

    // then
    expect(await screen.findByText('조건에 맞는 진도 현황이 없습니다.')).toBeInTheDocument();
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
