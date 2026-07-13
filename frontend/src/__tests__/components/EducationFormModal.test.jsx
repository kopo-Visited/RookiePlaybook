import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import EducationFormModal from '../../components/EducationFormModal/EducationFormModal';

const server = setupServer();
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderCreate() {
  render(<EducationFormModal onClose={() => {}} onSuccess={() => {}} />);
}

async function fillRequired(user) {
  await user.type(
    screen.getByPlaceholderText('교육 과정명을 입력하세요 (최대 100자)'),
    '백엔드 기초 교육'
  );
  await user.type(screen.getByPlaceholderText('0 ~ 100'), '80');
}

describe('EducationFormModal - 콘텐츠 기준연도', () => {
  it('콘텐츠 기준연도 입력칸이 렌더링된다', () => {
    // given & when
    renderCreate();

    // then
    expect(screen.getByText('콘텐츠 기준연도 (선택)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('예: 2024')).toBeInTheDocument();
  });

  it('기준연도가 2000 미만이면 안내 문구가 뜨고 저장이 비활성화된다', async () => {
    // given
    const user = userEvent.setup();
    renderCreate();
    await fillRequired(user);

    // when
    await user.type(screen.getByPlaceholderText('예: 2024'), '1999');

    // then
    expect(screen.getByText('콘텐츠 기준연도는 2000 이상이어야 합니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled();
  });

  it('올바른 기준연도를 입력하면 등록 payload에 contentYear가 포함된다', async () => {
    // given
    const user = userEvent.setup();
    let body = null;
    server.use(
      http.post('/api/admin/educations', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({
          success: true,
          message: '',
          data: { educationId: 5, title: '백엔드 기초 교육' },
        });
      })
    );
    renderCreate();
    await fillRequired(user);

    // when
    await user.type(screen.getByPlaceholderText('예: 2024'), '2024');
    await user.click(screen.getByRole('button', { name: '저장' }));

    // then
    await waitFor(() =>
      expect(body).toMatchObject({ title: '백엔드 기초 교육', contentYear: 2024 })
    );
  });

  it('기준연도를 비우면 payload의 contentYear가 null로 전송된다', async () => {
    // given
    const user = userEvent.setup();
    let body = null;
    server.use(
      http.post('/api/admin/educations', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({
          success: true,
          message: '',
          data: { educationId: 6, title: '백엔드 기초 교육' },
        });
      })
    );
    renderCreate();
    await fillRequired(user);

    // when (연도 미입력)
    await user.click(screen.getByRole('button', { name: '저장' }));

    // then
    await waitFor(() => expect(body).toMatchObject({ contentYear: null }));
  });
});

const mockDepartments = [
  { departmentId: 1, name: '개발팀' },
  { departmentId: 3, name: '보안팀' },
];

function renderCreateWithDepartments(departments = mockDepartments) {
  render(<EducationFormModal departments={departments} onClose={() => {}} onSuccess={() => {}} />);
}

describe('EducationFormModal - 대상 부서', () => {
  it('대상 부서 드롭다운이 렌더링되고 기본값은 공통이다', () => {
    // given & when
    renderCreateWithDepartments();

    // then
    expect(screen.getByText('대상 부서')).toBeInTheDocument();
    expect(screen.getByText('공통 (전체 부서)')).toBeInTheDocument();
  });

  it('부서를 선택하면 등록 payload에 departmentId가 포함된다', async () => {
    // given
    const user = userEvent.setup();
    let body = null;
    server.use(
      http.post('/api/admin/educations', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({
          success: true,
          message: '',
          data: { educationId: 7, title: '백엔드 기초 교육' },
        });
      })
    );
    renderCreateWithDepartments();
    await fillRequired(user);

    // when — 드롭다운을 열고 '개발팀' 선택
    await user.click(screen.getByText('공통 (전체 부서)'));
    await user.click(screen.getByText('개발팀'));
    await user.click(screen.getByRole('button', { name: '저장' }));

    // then
    await waitFor(() => expect(body).toMatchObject({ departmentId: 1 }));
  });

  it('부서를 지정하지 않으면 payload의 departmentId가 null로 전송된다', async () => {
    // given
    const user = userEvent.setup();
    let body = null;
    server.use(
      http.post('/api/admin/educations', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({
          success: true,
          message: '',
          data: { educationId: 8, title: '백엔드 기초 교육' },
        });
      })
    );
    renderCreateWithDepartments();
    await fillRequired(user);

    // when (부서 미선택 = 공통)
    await user.click(screen.getByRole('button', { name: '저장' }));

    // then
    await waitFor(() => expect(body).toMatchObject({ departmentId: null }));
  });

  it('편집 시 기존 부서가 선택된 상태로 표시된다', () => {
    // given & when
    render(
      <EducationFormModal
        education={{
          educationId: 2,
          title: '백엔드 기초 교육',
          completionCriteria: 100,
          departmentId: 1,
        }}
        departments={mockDepartments}
        onClose={() => {}}
        onSuccess={() => {}}
      />
    );

    // then — 드롭다운에 기존 부서명이 표시된다
    expect(screen.getByText('개발팀')).toBeInTheDocument();
  });
});
