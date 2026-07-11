import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './VideoPlayerPage.module.css';
import Button from '../../../components/Button/Button';
import Toast from '../../../components/Toast/Toast';
import Spinner from '../../../components/Spinner/Spinner';
import ErrorMessage from '../../../components/ErrorMessage/ErrorMessage';
import { BUTTON_VARIANTS } from '../../../constants/styles';
import { ROUTES } from '../../../constants/routes';
import useFetch from '../../../hooks/useFetch';
import useVideoProgress from '../../../hooks/edu/useVideoProgress';
import { getMaterial, getEducationDetail, completeStage } from '../../../api/eduApi';

// 이 비율 이상 시청해야 단계 완료가 가능하다
const WATCH_THRESHOLD = 0.95;

function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function IconPlay() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function IconPause() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}
function IconRewind() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M11 8L6 12l5 4V8zM18 8l-5 4 5 4V8z" fill="currentColor" />
    </svg>
  );
}
function IconForward() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M13 8l5 4-5 4V8zM6 8l5 4-5 4V8z" fill="currentColor" />
    </svg>
  );
}
function IconVolume({ muted }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" />
      {muted ? (
        <path d="M17 9l4 6M21 9l-4 6" strokeLinecap="round" />
      ) : (
        <path d="M16 8a5 5 0 010 8" strokeLinecap="round" />
      )}
    </svg>
  );
}
function IconFullscreen() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VideoPlayerPage() {
  const { id, stageId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const wrapRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [watched, setWatched] = useState(false);
  const [toast, setToast] = useState(null);

  const {
    data: matRes,
    loading: matLoading,
    error: matError,
  } = useFetch(() => getMaterial(stageId), [stageId]);
  const { data: detailRes } = useFetch(() => getEducationDetail(id), [id]);

  const material = matRes?.data;
  const detail = detailRes?.data;
  const stages = detail?.stages ?? [];
  const currentIndex = stages.findIndex(s => String(s.stageId) === String(stageId));
  const stage = currentIndex >= 0 ? stages[currentIndex] : null;
  const prevStage = currentIndex > 0 ? stages[currentIndex - 1] : null;
  const nextStage =
    currentIndex >= 0 && currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;

  useVideoProgress(videoRef, material?.materialId, material?.lastWatchedPosition ?? 0);

  // 단계 이동(stageId) 또는 자료 로드 시 완료/시청 상태 초기화.
  // 이어보기로 이미 기준 이상 시청한 경우 시청 완료로 간주한다.
  useEffect(() => {
    setJustCompleted(false);
    const resumeWatched =
      !!material?.totalDuration &&
      (material.lastWatchedPosition ?? 0) / material.totalDuration >= WATCH_THRESHOLD;
    setWatched(resumeWatched);
  }, [stageId, material]);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      // play()가 반환하는 Promise를 처리해 재생 거부 시 unhandled rejection을 막는다
      video.play()?.catch(() => {});
    } else {
      video.pause();
    }
  }
  function skip(delta) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + delta));
  }
  function onSeek(e) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Number(e.target.value);
    setCurrent(Number(e.target.value));
  }
  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }
  function toggleFullscreen() {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else wrap.requestFullscreen?.();
  }

  const isCompleted = justCompleted || Boolean(stage?.isCompleted);
  // 현재 영상을 95% 이상 봤거나, 이미 완료한 단계거나, 과정을 수료했으면 다음 단계로 이동 가능
  const canGoNext = watched || isCompleted || Boolean(detail?.isCompleted);

  async function handleComplete() {
    try {
      await completeStage(stageId);
      setJustCompleted(true);
      setToast('단계를 완료했습니다.');
    } catch {
      setToast('완료 처리에 실패했습니다.');
    }
  }

  return (
    <div className={styles.page}>
      {matLoading && <Spinner />}
      {!matLoading && matError && <ErrorMessage message="영상을 불러오지 못했습니다." />}

      {material && (
        <div className={styles.card}>
          <div className={styles.playerWrap} ref={wrapRef}>
            <video
              ref={videoRef}
              className={styles.video}
              // 이어보기 위치가 없으면 미디어 프래그먼트(#t=0.1)로 첫 프레임을 네이티브 표시한다.
              // JS로 currentTime을 seek하면 재생 제스처(play())와 경쟁해 첫 클릭이 무시되므로 프래그먼트를 쓴다.
              // (이어보기 위치가 있으면 useVideoProgress가 그 위치로 복원하므로 프래그먼트를 붙이지 않는다)
              src={material.lastWatchedPosition ? material.videoUrl : `${material.videoUrl}#t=0.1`}
              preload="metadata"
              onClick={togglePlay}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setWatched(true)}
              onTimeUpdate={e => {
                const video = e.currentTarget;
                setCurrent(video.currentTime);
                if (video.duration && video.currentTime / video.duration >= WATCH_THRESHOLD) {
                  setWatched(true);
                }
              }}
              onLoadedMetadata={e => setDuration(e.currentTarget.duration)}
            />

            {!playing && (
              <button className={styles.centerPlay} onClick={togglePlay} aria-label="재생">
                <IconPlay />
              </button>
            )}

            <div className={styles.controls}>
              <input
                type="range"
                className={styles.seek}
                min="0"
                max={duration || 0}
                step="0.1"
                value={current}
                onChange={onSeek}
              />
              <div className={styles.controlRow}>
                <span className={styles.time}>
                  {formatTime(current)} / {formatTime(duration)}
                </span>
                <div className={styles.centerBtns}>
                  <button
                    className={styles.ctrlBtn}
                    onClick={() => skip(-10)}
                    aria-label="10초 뒤로"
                  >
                    <IconRewind />
                  </button>
                  <button
                    className={styles.ctrlBtn}
                    onClick={togglePlay}
                    aria-label="재생/일시정지"
                  >
                    {playing ? <IconPause /> : <IconPlay />}
                  </button>
                  <button
                    className={styles.ctrlBtn}
                    onClick={() => skip(10)}
                    aria-label="10초 앞으로"
                  >
                    <IconForward />
                  </button>
                </div>
                <div className={styles.rightBtns}>
                  <button className={styles.ctrlBtn} onClick={toggleMute} aria-label="음소거">
                    <IconVolume muted={muted} />
                  </button>
                  <button
                    className={styles.ctrlBtn}
                    onClick={toggleFullscreen}
                    aria-label="전체화면"
                  >
                    <IconFullscreen />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.info}>
            <h1 className={styles.courseTitle}>[{detail?.title}]</h1>
            <p className={styles.videoTitle}>영상 제목 : {stage?.title ?? material.title}</p>
            {stage?.description && <p className={styles.videoDesc}>{stage.description}</p>}
          </div>

          <div className={styles.actions}>
            <Button
              variant={BUTTON_VARIANTS.PRIMARY}
              disabled={isCompleted || !watched}
              onClick={handleComplete}
            >
              {isCompleted ? '완료됨' : '단계 완료'}
            </Button>
            <Button
              variant={BUTTON_VARIANTS.PRIMARY}
              disabled={!prevStage}
              onClick={() => prevStage && navigate(ROUTES.EDU.VIDEO(id, prevStage.stageId))}
            >
              ‹ 이전 영상
            </Button>
            <Button
              variant={BUTTON_VARIANTS.PRIMARY}
              disabled={!nextStage || !canGoNext}
              onClick={() => nextStage && navigate(ROUTES.EDU.VIDEO(id, nextStage.stageId))}
            >
              다음 영상 ›
            </Button>
            <Button
              variant={BUTTON_VARIANTS.SECONDARY}
              onClick={() => navigate(ROUTES.EDU.DETAIL(id))}
            >
              ← 목록으로
            </Button>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

export default VideoPlayerPage;
