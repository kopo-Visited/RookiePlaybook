import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import useVideoProgress from '../../hooks/edu/useVideoProgress';
import { saveVideoProgress } from '../../api/eduApi';

vi.mock('../../api/eduApi', () => ({
  saveVideoProgress: vi.fn(() => Promise.resolve()),
}));

function createFakeVideo() {
  const listeners = {};
  return {
    currentTime: 0,
    paused: true,
    ended: false,
    addEventListener(type, cb) {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(cb);
    },
    removeEventListener(type, cb) {
      listeners[type] = (listeners[type] || []).filter(fn => fn !== cb);
    },
    dispatch(type) {
      (listeners[type] || []).forEach(cb => cb());
    },
  };
}

describe('useVideoProgress', () => {
  beforeEach(() => {
    saveVideoProgress.mockClear();
  });

  it('loadedmetadata 시 이어보기 위치로 currentTime을 설정한다', () => {
    // given
    const video = createFakeVideo();
    const ref = { current: video };

    // when
    renderHook(() => useVideoProgress(ref, 5, 120));
    video.dispatch('loadedmetadata');

    // then
    expect(video.currentTime).toBe(120);
  });

  it('일시정지 시 시청 위치를 정수로 저장한다', () => {
    // given
    const video = createFakeVideo();
    video.currentTime = 90.7;
    const ref = { current: video };

    // when
    renderHook(() => useVideoProgress(ref, 5, 0));
    video.dispatch('pause');

    // then
    expect(saveVideoProgress).toHaveBeenCalledWith({ materialId: 5, watchedPosition: 90 });
  });

  it('언마운트 시 마지막 위치를 저장한다', () => {
    // given
    const video = createFakeVideo();
    video.currentTime = 45;
    const ref = { current: video };
    const { unmount } = renderHook(() => useVideoProgress(ref, 5, 0));
    saveVideoProgress.mockClear();

    // when
    unmount();

    // then
    expect(saveVideoProgress).toHaveBeenCalledWith({ materialId: 5, watchedPosition: 45 });
  });
});
