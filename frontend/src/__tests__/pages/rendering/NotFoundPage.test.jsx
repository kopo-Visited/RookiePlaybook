import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFoundPage from '../../../pages/error/NotFoundPage/NotFoundPage';
import { ROUTES } from '../../../constants/routes';

describe('NotFoundPage', () => {
  it('404 안내와 대시보드로 이동하는 링크가 렌더링된다', () => {
    // given & when
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    // then
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('페이지를 찾을 수 없습니다.')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: '대시보드로 이동' });
    expect(link).toHaveAttribute('href', ROUTES.DASHBOARD);
  });
});
