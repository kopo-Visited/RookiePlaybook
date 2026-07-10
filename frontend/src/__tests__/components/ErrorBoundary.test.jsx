import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';

function ProblemChild() {
  throw new Error('테스트용 렌더링 오류');
}

describe('ErrorBoundary', () => {
  it('정상적인 자식 컴포넌트는 그대로 렌더링한다', () => {
    // given & when
    render(
      <ErrorBoundary>
        <div>정상 콘텐츠</div>
      </ErrorBoundary>
    );

    // then
    expect(screen.getByText('정상 콘텐츠')).toBeInTheDocument();
  });

  it('자식 컴포넌트에서 렌더링 오류가 발생하면 대체 UI를 보여준다', () => {
    // given
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // when
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    // then
    expect(screen.getByText('예상치 못한 오류가 발생했습니다.')).toBeInTheDocument();
    expect(screen.queryByText('정상 콘텐츠')).not.toBeInTheDocument();

    console.error.mockRestore();
  });

  it('새로고침 버튼을 클릭하면 페이지를 새로고침한다', () => {
    // given
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    // when
    fireEvent.click(screen.getByText('새로고침'));

    // then
    expect(reloadSpy).toHaveBeenCalledTimes(1);

    console.error.mockRestore();
  });
});
