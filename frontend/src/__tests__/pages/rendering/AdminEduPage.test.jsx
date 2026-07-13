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
    departmentId: null,
    departmentName: null, // 공통
  },
  {
    educationId: 2,
    title: '백엔드 기초 교육',
    totalStages: 2,
    completedStages: 0,
    progressRate: 0,
    departmentId: 1,
    departmentName: '개발팀', // 개발
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
    http.get('/api/admin/educations', () =>
      apiOk({ content, totalPages: 1, number: 0, size: 10, totalElements: content.length })
    )
  );
}

// 전체 11개를 한 번에 받아 클라이언트에서 10개씩 페이지네이션한다 (최신순 = id 내림차순)
function mockListPaged() {
  const content = Array.from({ length: 11 }, (_, i) => ({
    educationId: i + 1,
    title: `과정 ${String(i + 1).padStart(2, '0')}`,
    totalStages: 1,
    completedStages: 0,
    progressRate: 0,
    departmentName: null,
  }));
  server.use(
    http.get('/api/admin/educations', () =>
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

  it('부서별 교육 개수 요약 카드(개발/인프라/보안/네트워크/공통)가 렌더링된다', async () => {
    // given & when
    mockListSuccess();
    render(<AdminEduPage />);
    await screen.findByText('신입사원 온보딩 교육');

    // then — 고정 5개 카테고리 라벨
    expect(screen.getByText('네트워크')).toBeInTheDocument();
    expect(screen.getByText('보안')).toBeInTheDocument();
    expect(screen.getByText('인프라')).toBeInTheDocument();
    expect(screen.getByText('개발')).toBeInTheDocument();
    expect(screen.getByText('공통')).toBeInTheDocument();
  });

  it('검색어를 입력하면 제목으로 교육 과정이 필터링된다', async () => {
    // given
    mockListSuccess();
    render(<AdminEduPage />);
    await screen.findByText('신입사원 온보딩 교육');

    // when
    await userEvent.type(screen.getByPlaceholderText('교육 과정명을 입력하세요'), '백엔드');

    // then
    expect(screen.getByText('백엔드 기초 교육')).toBeInTheDocument();
    expect(screen.queryByText('신입사원 온보딩 교육')).not.toBeInTheDocument();
  });

  it('부서 요약 카드를 클릭하면 해당 부서 교육만 표시된다', async () => {
    // given
    mockListSuccess();
    render(<AdminEduPage />);
    await screen.findByText('신입사원 온보딩 교육');

    // when — '개발' 카드 클릭 (백엔드 기초=개발팀만 남고 공통 온보딩은 제외)
    await userEvent.click(screen.getByText('개발'));

    // then
    expect(screen.getByText('백엔드 기초 교육')).toBeInTheDocument();
    expect(screen.queryByText('신입사원 온보딩 교육')).not.toBeInTheDocument();
  });

  it('교육 등록 폼 부서 선택지에 인사팀이 없다', async () => {
    // given — 부서 목록에 인사팀 포함
    mockListSuccess();
    server.use(
      http.get('/api/departments', () =>
        apiOk([
          { departmentId: 1, name: '개발팀' },
          { departmentId: 4, name: '인사팀' },
          { departmentId: 5, name: '네트워크팀' },
        ])
      )
    );
    render(<AdminEduPage />);
    await screen.findByText('신입사원 온보딩 교육');

    // when — 과정 추가 모달 열고 부서 드롭다운 펼치기
    await userEvent.click(screen.getByRole('button', { name: '+ 과정 추가' }));
    await userEvent.click(screen.getByText('공통 (전체 부서)'));

    // then — 인사팀은 선택지에 없다
    expect(screen.getByText('개발팀')).toBeInTheDocument();
    expect(screen.getByText('네트워크팀')).toBeInTheDocument();
    expect(screen.queryByText('인사팀')).not.toBeInTheDocument();
  });

  it('과정 목록에 콘텐츠 기준연도가 "2024 과정" 형태로 표시된다', async () => {
    // given & when
    mockListSuccess([
      {
        educationId: 1,
        title: '백엔드 기초 교육',
        totalStages: 2,
        completedStages: 0,
        progressRate: 0,
        contentYear: 2024,
      },
    ]);
    render(<AdminEduPage />);

    // then
    expect(await screen.findByText('백엔드 기초 교육')).toBeInTheDocument();
    expect(screen.getByText('2024 과정')).toBeInTheDocument();
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

  it('과정이 여러 페이지면 페이지네이션이 노출되고 페이지 이동이 동작한다', async () => {
    // given — 전체 11개, 최신순(id 내림차순)이라 1페이지엔 과정 11, 마지막 페이지엔 과정 01
    mockListPaged();
    render(<AdminEduPage />);
    expect(await screen.findByText('과정 11')).toBeInTheDocument();

    // when
    await userEvent.click(screen.getByRole('button', { name: '2' }));

    // then
    expect(await screen.findByText('과정 01')).toBeInTheDocument();
  });

  it('과정이 한 페이지뿐이면 페이지네이션이 표시되지 않는다', async () => {
    // given & when
    mockListSuccess();
    render(<AdminEduPage />);
    await screen.findByText('신입사원 온보딩 교육');

    // then (지식문서와 동일하게 totalPages<=1이면 페이지 번호 숨김)
    expect(screen.queryByRole('button', { name: '2' })).not.toBeInTheDocument();
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
      http.get('/api/admin/educations', () =>
        HttpResponse.json({ message: 'error' }, { status: 500 })
      )
    );

    // when
    render(<AdminEduPage />);

    // then
    expect(await screen.findByText('오류가 발생했습니다.')).toBeInTheDocument();
  });
});
