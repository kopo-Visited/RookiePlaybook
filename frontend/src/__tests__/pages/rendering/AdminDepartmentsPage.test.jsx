import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { vi } from 'vitest';
import AdminDepartmentsPage from '../../../pages/admin/AdminDepartmentsPage/AdminDepartmentsPage';
import useToastStore from '../../../stores/toastStore';

const mockDepartments = [
  { departmentId: 1, code: 'DEV', name: '개발팀' },
  { departmentId: 2, code: 'SEC', name: '보안팀' },
];

const mockUsers = [
  { userId: 1, name: '이00', departmentId: 1, departmentName: '개발팀' },
  { userId: 2, name: '손00', departmentId: 1, departmentName: '개발팀' },
  { userId: 3, name: '박00', departmentId: 2, departmentName: '보안팀' },
];

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function mockDefaultHandlers() {
  server.use(
    http.get('/api/departments', () =>
      HttpResponse.json({ success: true, message: '', data: mockDepartments })
    ),
    http.get('/api/admin/users', () =>
      HttpResponse.json({ success: true, message: '', data: mockUsers })
    )
  );
}

describe('AdminDepartmentsPage 렌더링', () => {
  it('페이지 제목과 통계 카드, 부서 목록이 렌더링된다', async () => {
    // given & when
    mockDefaultHandlers();
    render(<AdminDepartmentsPage />);

    // then
    expect(screen.getByRole('heading', { name: '부서 관리' })).toBeInTheDocument();
    expect(screen.getByText('전체 부서')).toBeInTheDocument();
    expect(screen.getByText('전체 소속 인원')).toBeInTheDocument();
    expect(screen.getByText('부서당 평균 인원')).toBeInTheDocument();
    const table = await screen.findByRole('table');
    expect(within(table).getByText('개발팀')).toBeInTheDocument();
    expect(within(table).getByText('보안팀')).toBeInTheDocument();
  });

  it('부서별 인원수가 정확히 집계되어 표시된다', async () => {
    // given & when
    mockDefaultHandlers();
    render(<AdminDepartmentsPage />);
    const table = await screen.findByRole('table');

    // then
    const rows = within(table).getAllByRole('row');
    const devRow = rows.find(r => r.textContent.includes('개발팀'));
    const secRow = rows.find(r => r.textContent.includes('보안팀'));
    expect(devRow.textContent).toContain('2명');
    expect(secRow.textContent).toContain('1명');
  });

  it('부서별 인원 현황 패널이 렌더링된다', async () => {
    // given & when
    mockDefaultHandlers();
    render(<AdminDepartmentsPage />);

    // then
    expect(await screen.findByText('부서별 인원 현황')).toBeInTheDocument();
  });
});

describe('AdminDepartmentsPage 인터랙션', () => {
  it('부서 추가 버튼을 누르면 등록 모달이 열리고 취소하면 닫힌다', async () => {
    // given
    mockDefaultHandlers();
    render(<AdminDepartmentsPage />);
    await screen.findByRole('table');

    // when
    await userEvent.click(screen.getByRole('button', { name: '+ 부서 추가' }));

    // then
    expect(screen.getByText('부서 추가')).toBeInTheDocument();

    // when
    await userEvent.click(screen.getByRole('button', { name: '취소' }));

    // then
    expect(screen.queryByText('부서 추가')).not.toBeInTheDocument();
  });

  it('수정 버튼을 누르면 부서 코드와 이름을 모두 수정할 수 있는 모달이 열린다', async () => {
    // given
    mockDefaultHandlers();
    let updateRequestBody = null;
    server.use(
      http.put('/api/admin/departments/:departmentId', async ({ request }) => {
        updateRequestBody = await request.json();
        return HttpResponse.json({
          success: true,
          message: '부서 정보가 변경되었습니다.',
          data: { departmentId: 1, code: 'DEVOPS', name: '개발운영팀' },
        });
      })
    );
    render(<AdminDepartmentsPage />);
    await screen.findByRole('table');

    // when
    const [firstEditButton] = screen.getAllByRole('button', { name: '수정' });
    await userEvent.click(firstEditButton);

    // then — 코드/이름 입력 필드 둘 다 존재하고 기존 값이 채워져 있다
    const codeInput = screen.getByPlaceholderText('예: QA');
    expect(codeInput).toHaveValue('DEV');

    // when — 코드와 이름을 모두 변경
    await userEvent.clear(codeInput);
    await userEvent.type(codeInput, 'DEVOPS');
    const nameInput = screen.getByPlaceholderText('예: 품질보증팀');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, '개발운영팀');
    await userEvent.click(screen.getByRole('button', { name: '저장' }));

    // then
    await waitFor(() => expect(updateRequestBody).toEqual({ code: 'DEVOPS', name: '개발운영팀' }));
  });

  it('삭제 버튼을 누르고 확인하면 삭제 API를 호출하고 목록을 재조회한다', async () => {
    // given
    mockDefaultHandlers();
    let deletedId = null;
    server.use(
      http.delete('/api/admin/departments/:departmentId', ({ params }) => {
        deletedId = params.departmentId;
        return HttpResponse.json({ success: true, message: '부서가 삭제되었습니다.', data: null });
      })
    );
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<AdminDepartmentsPage />);
    await screen.findByRole('table');

    // when
    const [firstDeleteButton] = screen.getAllByRole('button', { name: '삭제' });
    await userEvent.click(firstDeleteButton);

    // then
    await waitFor(() => expect(deletedId).toBe('1'));
    expect(confirmSpy).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('소속된 사용자가 있는 부서를 삭제하려 하면 서버 에러 메시지가 토스트로 표시된다', async () => {
    // given
    mockDefaultHandlers();
    server.use(
      http.delete('/api/admin/departments/:departmentId', () =>
        HttpResponse.json(
          {
            success: false,
            message: '소속된 사용자가 있어 삭제할 수 없습니다.',
            errorCode: 'CONFLICT',
          },
          { status: 409 }
        )
      )
    );
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<AdminDepartmentsPage />);
    await screen.findByRole('table');

    // when
    const [firstDeleteButton] = screen.getAllByRole('button', { name: '삭제' });
    await userEvent.click(firstDeleteButton);

    // then
    await waitFor(() =>
      expect(useToastStore.getState().message).toBe('소속된 사용자가 있어 삭제할 수 없습니다.')
    );
  });
});
