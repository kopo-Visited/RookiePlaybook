import { useEffect } from 'react';
import { saveVideoProgress } from '../../api/eduApi';

const SAVE_INTERVAL_MS = 30000; // 30초마다 저장

// 이어보기 시작 위치 복원 + 30초마다/일시정지/종료/언마운트 시 시청 위치 저장
const useVideoProgress = (videoRef, materialId, initialPosition = 0) => {
  useEffect(() => {
    const video = videoRef.current;
    if (!video || materialId == null) return undefined;

    const save = () => {
      const watchedPosition = Math.floor(video.currentTime || 0);
      saveVideoProgress({ materialId, watchedPosition }).catch(() => {});
    };

    const restorePosition = () => {
      if (initialPosition > 0) video.currentTime = initialPosition;
    };

    video.addEventListener('loadedmetadata', restorePosition);
    video.addEventListener('pause', save);
    video.addEventListener('ended', save);

    const timer = setInterval(() => {
      if (!video.paused && !video.ended) save();
    }, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(timer);
      video.removeEventListener('loadedmetadata', restorePosition);
      video.removeEventListener('pause', save);
      video.removeEventListener('ended', save);
      save();
    };
  }, [videoRef, materialId, initialPosition]);
};

export default useVideoProgress;
