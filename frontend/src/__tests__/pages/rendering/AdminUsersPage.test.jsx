import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import AdminUsersPage from '../../../pages/admin/AdminUsersPage/AdminUsersPage';

const mockUsers = [
  {
    userId: 1,
    name: '이00',
    email: 'user1@company.com',
    departmentId: 1,
    departmentName: '개발팀',
    roleId: 1,
    roleName: '일반 사용자',
    roleCode: 'ROLE_USER',
    position: '대리',
    status: 'ACTIVE',
    lastLoginAt: '2024-05-28T09:32:00',
    createdAt: '2024-05-01T00:00:00',
  },
  {
    userId: 2,
    name: '손00',
    email: 'user2@company.com',
    departmentId: 2,
    departmentName: '보안팀',
    roleId: 2,
    roleName: '관리자',
    roleCode: 'ROLE_ADMIN',
    position: '과장',
    status: 'ACTIVE',
    lastLoginAt: '2024-05-27T08:15:00',
    createdAt: '2024-04-01T00:00:00',
  },
];

const mockDepartments = [
  { departmentId: 1, code: 'DEV', name: '개발팀' },
  { departmentId: 2, code: 'SEC', name: '보안팀' },
];

const mockRoles = [
  { roleId: 1, code: 'ROLE_USER', name: '일반 사용자' },
  { roleId: 2, code: 'ROLE_ADMIN', name: '관리자' },
];

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function mockDefaultHandlers() {
  server.use(
    http.get('/api/admin/users', () =>
      HttpResponse.json({ success: true, message: '', data: mockUsers })
    ),
    http.get('/api/departments', () =>
      HttpResponse.json({ success: true, message: '', data: mockDepartments })
    ),
    http.get('/api/roles', () => HttpResponse.json({ success: true, message: '', data: mockRoles }))
  );
}

describe('AdminUsersPage 렌더링', () => {
  it('페이지 제목과 통계 카드가 렌더링된다', async () => {
    // given & when
    mockDefaultHandlers();
    render(<AdminUsersPage />);

    // then
    expect(screen.getByRole('heading', { name: '사용자 관리' })).toBeInTheDocument();
    expect(screen.getByText('전체 사용자')).toBeInTheDocument();
    expect(screen.getByText('활성 사용자')).toBeInTheDocument();
    expect(screen.getByText('관리자 계정')).toBeInTheDocument();
    expect(screen.getByText('비활성 계정')).toBeInTheDocument();
    await screen.findByText('user1@company.com');
  });

  it('사용자 목록 테이블이 렌더링된다', async () => {
    // given & when
    mockDefaultHandlers();
    render(<AdminUsersPage />);

    // then
    expect(await screen.findByText('user1@company.com')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '이메일' })).toBeInTheDocument();
  });

  it('부서별 사용자 현황과 권한별 사용자 분포 패널이 렌더링된다', async () => {
    // given & when
    mockDefaultHandlers();
    render(<AdminUsersPage />);

    // then
    expect(screen.getByText('부서별 사용자 현황')).toBeInTheDocument();
    expect(screen.getByText('권한별 사용자 분포')).toBeInTheDocument();
    await screen.findByText('user1@company.com');
  });

  it('사용자 목록 조회에 실패하면 에러 메시지가 렌더링된다', async () => {
    // given
    server.use(
      http.get('/api/admin/users', () =>
        HttpResponse.json(
          { success: false, message: '일시적인 오류가 발생했습니다.', errorCode: 'SERVER_ERROR' },
          { status: 500 }
        )
      ),
      http.get('/api/departments', () =>
        HttpResponse.json({ success: true, message: '', data: mockDepartments })
      )
    );

    // when
    render(<AdminUsersPage />);

    // then
    expect(await screen.findByText('일시적인 오류가 발생했습니다.')).toBeInTheDocument();
  });
});

describe('AdminUsersPage 인터랙션', () => {
  it('이름으로 검색하면 일치하는 사용자만 표시된다', async () => {
    // given
    mockDefaultHandlers();
    render(<AdminUsersPage />);
    await screen.findByText('user1@company.com');

    // when
    await userEvent.type(screen.getByPlaceholderText('이름 또는 이메일 검색'), '이00');

    // then
    expect(screen.getByText('user1@company.com')).toBeInTheDocument();
    expect(screen.queryByText('user2@company.com')).not.toBeInTheDocument();
  });

  it('사용자 등록 버튼을 누르면 등록 모달이 열리고 취소하면 닫힌다', async () => {
    // given
    mockDefaultHandlers();
    render(<AdminUsersPage />);
    await screen.findByText('user1@company.com');

    // when
    await userEvent.click(screen.getByRole('button', { name: '+ 사용자 등록' }));

    // then
    expect(screen.getByRole('dialog', { name: '사용자 등록' })).toBeInTheDocument();

    // when
    await userEvent.click(screen.getByRole('button', { name: '취소' }));

    // then
    expect(screen.queryByRole('dialog', { name: '사용자 등록' })).not.toBeInTheDocument();
  });

  it('행의 수정 버튼을 누르면 사용자 정보 수정 모달이 열린다', async () => {
    // given
    mockDefaultHandlers();
    render(<AdminUsersPage />);
    await screen.findByText('user1@company.com');

    // when
    const [firstEditButton] = screen.getAllByRole('button', { name: '수정' });
    await userEvent.click(firstEditButton);

    // then
    expect(screen.getByRole('dialog', { name: '사용자 정보 수정' })).toBeInTheDocument();
  });

  it('사용자 등록 시 입력한 정보로 등록 API를 호출하고 목록을 재조회한다', async () => {
    // given
    mockDefaultHandlers();
    let createRequestBody = null;
    server.use(
      http.post('/api/admin/users', async ({ request }) => {
        createRequestBody = await request.json();
        return HttpResponse.json({
          success: true,
          message: '사용자가 등록되었습니다.',
          data: { ...mockUsers[0], userId: 3, name: '테스트유저' },
        });
      })
    );
    render(<AdminUsersPage />);
    await screen.findByText('user1@company.com');

    // when
    await userEvent.click(screen.getByRole('button', { name: '+ 사용자 등록' }));
    await userEvent.type(screen.getByPlaceholderText('이름을 입력하세요'), '테스트유저');
    await userEvent.type(
      screen.getByPlaceholderText('이메일 주소를 입력하세요'),
      'newuser@company.com'
    );
    await userEvent.click(screen.getByText('부서를 선택하세요'));
    await userEvent.click(screen.getAllByText('개발팀').find(el => el.tagName === 'LI'));
    await userEvent.click(screen.getByText('권한을 선택하세요'));
    await userEvent.click(screen.getAllByText('일반 사용자').find(el => el.tagName === 'LI'));
    await userEvent.type(screen.getByPlaceholderText('초기 비밀번호를 입력하세요'), 'Temp1234!');
    await userEvent.click(screen.getByRole('button', { name: '저장' }));

    // then
    await screen.findByRole('button', { name: '+ 사용자 등록' });
    expect(createRequestBody).toMatchObject({
      name: '테스트유저',
      email: 'newuser@company.com',
      departmentId: 1,
      roleId: 1,
    });
  });
});
