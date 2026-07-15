import { createElement } from 'react';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import useLogin from '../../hooks/auth/useLogin';

function wrapper({ children }) {
  return createElement(MemoryRouter, null, children);
}

describe('useLogin', () => {
  it('이메일이 비어있으면 에러 메시지를 설정하고 로딩 상태로 전환하지 않는다', async () => {
    // given
    const { result } = renderHook(() => useLogin(), { wrapper });

    // when
    await act(async () => {
      await result.current.login({ email: '  ', password: 'Temp1234!' });
    });

    // then
    expect(result.current.error).toBe('이메일을 입력해주세요.');
    expect(result.current.loading).toBe(false);
  });

  it('비밀번호가 비어있으면 에러 메시지를 설정한다', async () => {
    // given
    const { result } = renderHook(() => useLogin(), { wrapper });

    // when
    await act(async () => {
      await result.current.login({ email: 'user@company.com', password: '' });
    });

    // then
    expect(result.current.error).toBe('비밀번호를 입력해주세요.');
  });
});
