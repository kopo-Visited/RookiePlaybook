import useToastStore from '../../stores/toastStore';

describe('useToastStore', () => {
  afterEach(() => {
    useToastStore.getState().hide();
  });

  it('show를 호출하면 message가 설정된다', () => {
    // when
    useToastStore.getState().show('저장되었습니다.');

    // then
    expect(useToastStore.getState().message).toBe('저장되었습니다.');
  });

  it('hide를 호출하면 message가 초기화된다', () => {
    // given
    useToastStore.getState().show('저장되었습니다.');

    // when
    useToastStore.getState().hide();

    // then
    expect(useToastStore.getState().message).toBeNull();
  });
});
