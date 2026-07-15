import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import AdminSchedulePage from '../../../pages/admin/AdminSchedulePage/AdminSchedulePage';

const mockSchedules = [
  {
    id: 1,
    title: '신입 OT',
    place: '대회의실',
    scheduleDate: '2026-07-20',
    startTime: '10:00:00',
    endTime: '11:00:00',
    dotColor: '#2288FF',
    departmentId: 1,
  },
];

const mockDepartments = [
  { departmentId: 1, code: 'DEV', name: '개발팀' },
  { departmentId: 2, code: 'SEC', name: '보안팀' },
];

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function mockDefaultHandlers() {
  server.use(
    http.get('/api/admin/schedules', () =>
      HttpResponse.json({ success: true, message: '', data: mockSchedules })
    ),
    http.get('/api/admin/departments', () =>
      HttpResponse.json({ success: true, message: '', data: mockDepartments })
    )
  );
}

describe('AdminSchedulePage', () => {
  it('수정 모달의 대상 부서가 공용 Dropdown 컴포넌트로 렌더링되고 값을 변경할 수 있다', async () => {
    // given
    mockDefaultHandlers();
    let updateRequestBody = null;
    server.use(
      http.put('/api/admin/schedules/:id', async ({ request }) => {
        updateRequestBody = await request.json();
        return HttpResponse.json({ success: true, message: '', data: null });
      })
    );
    render(<AdminSchedulePage />);
    await screen.findByText('신입 OT');

    // when
    await userEvent.click(screen.getByRole('button', { name: '수정' }));

    // then — 대상 부서가 네이티브 select가 아니라 공용 Dropdown(클릭하면 옵션 목록이 뜨는 구조)로 렌더링된다
    const modal = screen.getByText('일정 수정').closest('div');
    const trigger = within(modal).getByText('개발팀');
    expect(trigger.closest('select')).toBeNull();
    await userEvent.click(trigger);
    expect(await within(modal).findByText('공통 (전체)')).toBeInTheDocument();

    // when — 대상 부서를 보안팀으로 변경 후 저장
    await userEvent.click(within(modal).getByText('보안팀'));
    await userEvent.click(screen.getByRole('button', { name: '저장' }));

    // then
    await waitFor(() => expect(updateRequestBody).toMatchObject({ departmentId: 2 }));
  });
});
