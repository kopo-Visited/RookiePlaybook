import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import QnaListPage from '../../../pages/qna/QnaListPage/QnaListPage';

const mockQnas = [
  {
    questionId: 1,
    title: 'VPN 연결 오류 문의',
    categoryName: '네트워크',
    status: 'RECEIVED',
    createdAt: '2026-07-03T09:00:00',
  },
  {
    questionId: 2,
    title: '개발 환경 세팅 관련 질문',
    categoryName: '개발',
    status: 'IN_PROGRESS',
    createdAt: '2026-07-02T10:00:00',
  },
  {
    questionId: 3,
    title: '계정 권한 신청은 어떻게 하나요',
    categoryName: '보안',
    status: 'ANSWERED',
    createdAt: '2026-07-02T11:00:00',
  },
  {
    questionId: 4,
    title: '온보딩 일정 확인',
    categoryName: '공통',
    status: 'ON_HOLD',
    createdAt: '2026-07-01T08:00:00',
  },
];

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function mockQnasSuccess(items = mockQnas) {
  server.use(
    http.get('/api/questions/me', () =>
      HttpResponse.json({ success: true, message: '', data: { content: items } })
    )
  );
}

function renderPage() {
  render(
    <MemoryRouter>
      <QnaListPage />
    </MemoryRouter>
  );
}

describe('QnaListPage 렌더링', () => {
  it('페이지 제목과 부제목이 렌더링된다', () => {
    // given & when
    mockQnasSuccess();
    renderPage();

    // then
    expect(screen.getByRole('heading', { name: '질문·답변' })).toBeInTheDocument();
    expect(screen.getByText('내 질문 및 답변을 확인할 수 있어요.')).toBeInTheDocument();
  });

  it('상태 필터 칩(전체/접수/처리중/답변완료/보류)이 모두 렌더링된다', () => {
    // given & when
    mockQnasSuccess();
    renderPage();

    // then
    expect(screen.getByRole('button', { name: /전체/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /접수/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /처리중/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /답변완료/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /보류/ })).toBeInTheDocument();
  });

  it('질문하기 버튼이 렌더링된다', () => {
    // given & when
    mockQnasSuccess();
    renderPage();

    // then
    expect(screen.getByRole('button', { name: '+ 질문하기' })).toBeInTheDocument();
  });

  it('테이블 컬럼 헤더가 렌더링된다', async () => {
    // given & when
    mockQnasSuccess();
    renderPage();

    // then
    expect(await screen.findByRole('columnheader', { name: '상태' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '카테고리' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '제목' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '등록일' })).toBeInTheDocument();
  });

  it('API 응답의 질문 목록이 행으로 렌더링된다', async () => {
    // given & when
    mockQnasSuccess();
    renderPage();

    // then
    expect(await screen.findByText('VPN 연결 오류 문의')).toBeInTheDocument();
    expect(screen.getByText('개발 환경 세팅 관련 질문')).toBeInTheDocument();
    expect(screen.getByText('계정 권한 신청은 어떻게 하나요')).toBeInTheDocument();
    expect(screen.getByText('온보딩 일정 확인')).toBeInTheDocument();
  });

  it('상태 배지(접수/처리중/답변완료/보류)가 렌더링된다', async () => {
    // given & when
    mockQnasSuccess();
    renderPage();

    // then
    expect(await screen.findByText('접수')).toBeInTheDocument();
    expect(screen.getByText('처리중')).toBeInTheDocument();
    expect(screen.getByText('답변완료')).toBeInTheDocument();
    expect(screen.getByText('보류')).toBeInTheDocument();
  });

  it('목록이 비어있으면 빈 상태 메시지가 렌더링된다', async () => {
    // given & when
    mockQnasSuccess([]);
    renderPage();

    // then
    expect(await screen.findByText('등록된 질문이 없습니다.')).toBeInTheDocument();
  });

  it('API 실패 시 에러 메시지가 렌더링된다', async () => {
    // given
    server.use(
      http.get('/api/questions/me', () => HttpResponse.json({ message: 'error' }, { status: 500 }))
    );

    // when
    renderPage();

    // then
    expect(await screen.findByText('오류가 발생했습니다.')).toBeInTheDocument();
  });
});

describe('QnaListPage 인터랙션', () => {
  it('상태 칩 클릭 시 해당 상태 항목만 테이블에 표시된다', async () => {
    // given
    mockQnasSuccess();
    renderPage();
    await screen.findByText('VPN 연결 오류 문의');

    // when
    await userEvent.click(screen.getByRole('button', { name: /접수/ }));

    // then
    expect(screen.getByText('VPN 연결 오류 문의')).toBeInTheDocument();
    expect(screen.queryByText('개발 환경 세팅 관련 질문')).not.toBeInTheDocument();
  });

  it('질문하기 버튼 클릭 시 QnaQuestionModal이 열린다', async () => {
    // given
    mockQnasSuccess();
    renderPage();

    // when
    await userEvent.click(screen.getByRole('button', { name: '+ 질문하기' }));

    // then
    expect(screen.getByText('질문 작성')).toBeInTheDocument();
  });
});
