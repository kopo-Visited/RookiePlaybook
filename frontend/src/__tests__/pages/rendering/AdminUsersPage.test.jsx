import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminUsersPage from '../../../pages/admin/AdminUsersPage/AdminUsersPage';

describe('AdminUsersPage 렌더링', () => {
  it('페이지 제목과 통계 카드가 렌더링된다', () => {
    // given & when
    render(<AdminUsersPage />);

    // then
    expect(screen.getByRole('heading', { name: '사용자 관리' })).toBeInTheDocument();
    expect(screen.getByText('전체 사용자')).toBeInTheDocument();
    expect(screen.getByText('활성 사용자')).toBeInTheDocument();
    expect(screen.getByText('관리자 계정')).toBeInTheDocument();
    expect(screen.getByText('비활성 계정')).toBeInTheDocument();
  });

  it('사용자 목록 테이블이 렌더링된다', () => {
    // given & when
    render(<AdminUsersPage />);

    // then
    expect(screen.getByRole('columnheader', { name: '이메일' })).toBeInTheDocument();
    expect(screen.getByText('user1@company.com')).toBeInTheDocument();
  });

  it('부서별 사용자 현황과 권한별 사용자 분포 패널이 렌더링된다', () => {
    // given & when
    render(<AdminUsersPage />);

    // then
    expect(screen.getByText('부서별 사용자 현황')).toBeInTheDocument();
    expect(screen.getByText('권한별 사용자 분포')).toBeInTheDocument();
  });
});

describe('AdminUsersPage 인터랙션', () => {
  it('이름으로 검색하면 일치하는 사용자만 표시된다', async () => {
    // given
    render(<AdminUsersPage />);

    // when
    await userEvent.type(screen.getByPlaceholderText('이름 또는 이메일 검색'), '이00');

    // then
    expect(screen.getByText('user1@company.com')).toBeInTheDocument();
    expect(screen.queryByText('user2@company.com')).not.toBeInTheDocument();
  });

  it('사용자 등록 버튼을 누르면 등록 모달이 열리고 취소하면 닫힌다', async () => {
    // given
    render(<AdminUsersPage />);

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
    render(<AdminUsersPage />);

    // when
    const [firstEditButton] = screen.getAllByRole('button', { name: '수정' });
    await userEvent.click(firstEditButton);

    // then
    expect(screen.getByRole('dialog', { name: '사용자 정보 수정' })).toBeInTheDocument();
  });
});
