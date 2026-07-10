import axiosInstance from '../../api/axiosInstance';
import useAuthStore from '../../stores/authStore';
import useToastStore from '../../stores/toastStore';
import { ROUTES } from '../../constants/routes';

const { rejected } = axiosInstance.interceptors.response.handlers[0];

function mockLocation(pathname) {
  Object.defineProperty(window, 'location', {
    value: { pathname, href: '' },
    writable: true,
    configurable: true,
  });
}

describe('axiosInstance 응답 인터셉터', () => {
  beforeEach(() => {
    useAuthStore.getState().login({ name: '홍길동' }, 'token-abc');
    mockLocation('/dashboard');
  });

  afterEach(() => {
    useAuthStore.getState().logout();
    useToastStore.getState().hide();
  });

  it('401이면 로그아웃하고 세션 만료 안내 후 로그인 페이지로 이동한다', async () => {
    // given
    const error = { response: { status: 401 } };

    // when & then
    await expect(rejected(error)).rejects.toBe(error);
    expect(useAuthStore.getState().token).toBeNull();
    expect(useToastStore.getState().message).toBe('세션이 만료되었습니다. 다시 로그인해주세요.');
    expect(window.location.href).toBe(ROUTES.LOGIN);
  });

  it('이미 로그인 페이지에 있으면 401이어도 다시 이동시키지 않는다', async () => {
    // given
    mockLocation(ROUTES.LOGIN);
    const error = { response: { status: 401 } };

    // when
    await expect(rejected(error)).rejects.toBe(error);

    // then
    expect(window.location.href).toBe('');
  });

  it('403이면 권한 없음 안내를 보여준다', async () => {
    // given
    const error = { response: { status: 403 } };

    // when & then
    await expect(rejected(error)).rejects.toBe(error);
    expect(useToastStore.getState().message).toBe('접근 권한이 없습니다.');
    expect(useAuthStore.getState().token).toBe('token-abc');
  });

  it('500이면 일시적 오류 안내를 보여준다', async () => {
    // given
    const error = { response: { status: 500 } };

    // when & then
    await expect(rejected(error)).rejects.toBe(error);
    expect(useToastStore.getState().message).toBe(
      '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    );
  });

  it('503(외부 서비스 오류)도 일시적 오류 안내를 보여준다', async () => {
    // given
    const error = { response: { status: 503 } };

    // when & then
    await expect(rejected(error)).rejects.toBe(error);
    expect(useToastStore.getState().message).toBe(
      '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    );
  });

  it('400 등 그 외 상태코드는 전역 토스트를 띄우지 않는다', async () => {
    // given
    const error = { response: { status: 400 } };

    // when & then
    await expect(rejected(error)).rejects.toBe(error);
    expect(useToastStore.getState().message).toBeNull();
  });
});
