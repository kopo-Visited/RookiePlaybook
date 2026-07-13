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
import { getMaterial, getEducationDetail, completeStage, enroll } from '../../../api/eduApi';

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
function IconArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M19 12H5M5 12l7 7M5 12l7-7"
        stroke="currentColor"
        strokeWidth="2"
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
  const [advancing, setAdvancing] = useState(false);
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

  // 안전망: 단계 직접 클릭 등 어떤 경로로 진입해도 수강 상태로 만든다 (멱등)
  useEffect(() => {
    enroll(id).catch(() => {});
  }, [id]);

  // 순차 잠금: 잠긴 단계로 URL 직접 진입하면 백엔드가 403을 주므로 상세로 되돌린다
  useEffect(() => {
    if (matError?.response?.status === 403) {
      navigate(ROUTES.EDU.DETAIL(id), { replace: true });
    }
  }, [matError, id, navigate]);

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
  // 다음 영상 / 학습 완료 버튼 활성 조건: 영상을 충분히 시청했거나 이미 완료한 경우
  const canAdvance = watched || isCompleted;

  // 현재 단계를 (미완료면) 완료 처리한 뒤 목표 경로로 이동한다
  async function advanceTo(target) {
    if (advancing) return;
    setAdvancing(true);
    try {
      if (!isCompleted) await completeStage(stageId);
      navigate(target);
    } catch {
      setToast('완료 처리에 실패했습니다.');
      setAdvancing(false);
    }
  }
  function handleNext() {
    if (nextStage) advanceTo(ROUTES.EDU.VIDEO(id, nextStage.stageId));
  }
  function handleFinish() {
    advanceTo(ROUTES.EDU.DETAIL(id));
  }

  return (
    <div className={styles.page}>
      {matLoading && <Spinner />}
      {!matLoading && matError && <ErrorMessage message="영상을 불러오지 못했습니다." />}

      {material && (
        <div className={styles.main}>
          <button className={styles.backBtn} onClick={() => navigate(ROUTES.EDU.DETAIL(id))}>
            <IconArrowLeft />
            목록으로
          </button>
          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <span className={styles.sidebarHeading}>단계 ({stages.length})</span>
              <ul className={styles.stageList}>
                {stages.map((s, i) => {
                  // 순차 잠금: 직전 단계를 완료하지 않았으면 잠긴다 (첫 단계는 항상 열림)
                  const locked = i > 0 && !stages[i - 1].isCompleted;
                  const isCurrent = String(s.stageId) === String(stageId);
                  const completed = s.isCompleted || (isCurrent && justCompleted);
                  return (
                    <li
                      key={s.stageId}
                      className={`${styles.stageItem} ${isCurrent ? styles.stageItemActive : ''}`}
                      style={locked ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}
                      onClick={() => {
                        if (!locked && !isCurrent) navigate(ROUTES.EDU.VIDEO(id, s.stageId));
                      }}
                    >
                      <div className={styles.stageOrder}>{s.orderNumber}</div>
                      <div className={styles.stageBody}>
                        <div className={styles.stageTitleRow}>
                          <span className={styles.stageTitle}>{s.title}</span>
                          {locked ? (
                            <span
                              className={styles.badge}
                              style={{
                                background: '#EEF1F6',
                                color: 'var(--color-text-secondary)',
                              }}
                            >
                              🔒 잠김
                            </span>
                          ) : (
                            <span
                              className={styles.badge}
                              style={{
                                background: completed ? 'var(--color-green-bg)' : '#EEF1F6',
                                color: completed
                                  ? 'var(--color-green)'
                                  : 'var(--color-text-secondary)',
                              }}
                            >
                              {completed ? '완료' : '미완료'}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </aside>

            <div className={styles.card}>
              <div className={styles.playerWrap} ref={wrapRef}>
                <video
                  ref={videoRef}
                  className={styles.video}
                  // 이어보기 위치가 없으면 미디어 프래그먼트(#t=0.1)로 첫 프레임을 네이티브 표시한다.
                  // JS로 currentTime을 seek하면 재생 제스처(play())와 경쟁해 첫 클릭이 무시되므로 프래그먼트를 쓴다.
                  // (이어보기 위치가 있으면 useVideoProgress가 그 위치로 복원하므로 프래그먼트를 붙이지 않는다)
                  src={
                    material.lastWatchedPosition ? material.videoUrl : `${material.videoUrl}#t=0.1`
                  }
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
                <p className={styles.videoTitle}>
                  영상 제목 : {stage?.title ?? material.title}
                  {currentIndex >= 0 &&
                    stages.length > 0 &&
                    ` (${currentIndex + 1}/${stages.length}단계)`}
                </p>
                {stage?.description && <p className={styles.videoDesc}>{stage.description}</p>}
              </div>

              <div className={styles.actions}>
                <Button
                  variant={BUTTON_VARIANTS.PRIMARY}
                  disabled={!prevStage}
                  onClick={() => prevStage && navigate(ROUTES.EDU.VIDEO(id, prevStage.stageId))}
                >
                  ‹ 이전 영상
                </Button>
                {nextStage ? (
                  <Button
                    variant={BUTTON_VARIANTS.PRIMARY}
                    disabled={!canAdvance || advancing}
                    onClick={handleNext}
                  >
                    다음 영상 ›
                  </Button>
                ) : (
                  <Button
                    variant={BUTTON_VARIANTS.PRIMARY}
                    disabled={!canAdvance || advancing}
                    onClick={handleFinish}
                  >
                    학습 완료
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

export default VideoPlayerPage;
