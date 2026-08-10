import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import "../styles/preloader.css";

const PreloaderCapture = lazy(() => import("./PreloaderCapture"));

export const PRELOADER_STORAGE_KEY = "mb:preloader:version";
export const PRELOADER_STORAGE_VERSION = "2026-07-25-optimized";
export const PRELOADER_FINISHED_EVENT = "mb:preloader-finished";

const PRELOADER_VIDEO_DURATION_MS = 3800;
const PRELOADER_MAX_VISIBLE_MS = PRELOADER_VIDEO_DURATION_MS + 3000;
const PRELOADER_FADE_MS = 120;
const MOBILE_PRELOADER_QUERY = "(max-width: 680px)";

function isCaptureMode() {
  return new URLSearchParams(window.location.search).get("capturePreloader") === "1";
}

export function hasSeenPreloader() {
  if (isCaptureMode()) return false;
  try {
    return window.localStorage.getItem(PRELOADER_STORAGE_KEY) === PRELOADER_STORAGE_VERSION;
  } catch {
    return false;
  }
}

export function showPreloaderAfterReload() {
  try {
    window.localStorage.removeItem(PRELOADER_STORAGE_KEY);
  } catch {
    // Reload still applies the theme if storage is restricted.
  }
}

export function startThemeChangePreloader() {
  return new Promise((resolve) => {
    const isMobile = window.matchMedia?.(MOBILE_PRELOADER_QUERY)?.matches ?? false;
    const variant = isMobile ? "mobile" : "desktop";
    const overlay = document.createElement("div");
    overlay.className = "site-preloader site-preloader--theme-change";
    overlay.setAttribute("aria-label", "Смена темы ITMO MEGABATTLE");
    overlay.innerHTML = `
      <video class="site-preloader__video" autoplay muted playsinline preload="auto" poster="/videos/preloader-${variant}-poster.jpg">
        <source src="/videos/preloader-${variant}.webm" type="video/webm" />
        <source src="/videos/preloader-${variant}.mp4" type="video/mp4" />
      </video>`;
    document.body.classList.add("preloader-lock");
    document.body.appendChild(overlay);
    const video = overlay.querySelector("video");
    video?.play?.().catch?.(() => null);
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}

function rememberPreloader() {
  try {
    window.localStorage.setItem(PRELOADER_STORAGE_KEY, PRELOADER_STORAGE_VERSION);
  } catch {
    // В приватном режиме localStorage может быть недоступен: прелоадер всё равно
    // корректно завершится, но повторится после полной перезагрузки документа.
  }
}

export default function Preloader() {
  const captureMode = isCaptureMode();
  const [isMobileVideo, setIsMobileVideo] = useState(
    () => window.matchMedia?.(MOBILE_PRELOADER_QUERY)?.matches ?? false,
  );
  const [isLeaving, setIsLeaving] = useState(false);
  const [isHidden, setIsHidden] = useState(() => hasSeenPreloader());
  const [videoError, setVideoError] = useState(false);
  const finishRef = useRef(null);
  const pageLoadedRef = useRef(false);
  const mediaReadyRef = useRef(false);
  const videoRef = useRef(null);
  const useVideoPreloader = !captureMode && !videoError;
  const videoVariant = isMobileVideo ? "mobile" : "desktop";
  const preloaderPosterSrc = `/videos/preloader-${videoVariant}-poster.jpg`;

  const handleMediaReady = useCallback(() => {
    mediaReadyRef.current = true;
    finishRef.current?.();
  }, []);

  const handleVideoError = useCallback(() => {
    setVideoError(true);
    handleMediaReady();
  }, [handleMediaReady]);

  useEffect(() => {
    if (isHidden || captureMode) return undefined;
    const media = window.matchMedia?.(MOBILE_PRELOADER_QUERY);
    if (!media) return undefined;
    const update = () => setIsMobileVideo(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [captureMode, isHidden]);

  useEffect(() => {
    if (isHidden) return undefined;

    const startedAt = performance.now();
    let fadeTimer;
    let hideTimer;
    let maxTimer;
    let isFinished = false;

    performance.mark?.("mb-preloader-start");
    mediaReadyRef.current = false;
    pageLoadedRef.current = document.readyState === "complete";
    finishRef.current = null;
    setIsLeaving(false);
    document.body.classList.add("preloader-lock");

    const finish = (force = false) => {
      if (captureMode || isFinished) return;
      if (!force && (!pageLoadedRef.current || !mediaReadyRef.current)) return;
      isFinished = true;
      const elapsed = performance.now() - startedAt;
      const delay = Math.max(0, PRELOADER_VIDEO_DURATION_MS - elapsed);

      fadeTimer = window.setTimeout(() => {
        setIsLeaving(true);
        hideTimer = window.setTimeout(() => {
          rememberPreloader();
          document.body.classList.remove("preloader-lock");
          performance.mark?.("mb-preloader-end");
          performance.measure?.("mb-preloader-visible", "mb-preloader-start", "mb-preloader-end");
          setIsHidden(true);
          window.dispatchEvent(new Event(PRELOADER_FINISHED_EVENT));
        }, PRELOADER_FADE_MS);
      }, delay);
    };

    finishRef.current = finish;

    const handlePageLoad = () => {
      pageLoadedRef.current = true;
      finish();
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", handlePageLoad, { once: true });
    }

    maxTimer = captureMode
      ? undefined
      : window.setTimeout(() => finish(true), PRELOADER_MAX_VISIBLE_MS);

    return () => {
      window.removeEventListener("load", handlePageLoad);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
      window.clearTimeout(maxTimer);
      finishRef.current = null;
      document.body.classList.remove("preloader-lock");
    };
  }, [captureMode, isHidden]);

  useEffect(() => {
    if (!useVideoPreloader || isHidden) return undefined;
    const video = videoRef.current;
    if (!video) return undefined;
    video.currentTime = 0;
    video.play?.().catch?.(handleVideoError);
    return undefined;
  }, [handleVideoError, isHidden, useVideoPreloader, videoVariant]);

  if (isHidden) return null;

  return (
    <div
      className={`site-preloader${isLeaving ? " site-preloader--leaving" : ""}`}
      aria-live="polite"
      aria-label="Загрузка ITMO MEGABATTLE"
    >
      {captureMode ? (
        <Suspense fallback={null}>
          <PreloaderCapture onReady={handleMediaReady} />
        </Suspense>
      ) : null}

      {useVideoPreloader ? (
        <video
          key={videoVariant}
          ref={videoRef}
          className="site-preloader__video"
          autoPlay
          muted
          playsInline
          preload="auto"
          poster={preloaderPosterSrc}
          onLoadedData={handleMediaReady}
          onCanPlay={handleMediaReady}
          onError={handleVideoError}
          aria-hidden="true"
        >
          <source src={`/videos/preloader-${videoVariant}.webm`} type="video/webm" />
          <source src={`/videos/preloader-${videoVariant}.mp4`} type="video/mp4" />
        </video>
      ) : null}

      {!captureMode && videoError ? (
        <div className="site-preloader__video-fallback" aria-hidden="true">
          <img src="/logo.svg" width="109" height="67" alt="" />
        </div>
      ) : null}
    </div>
  );
}
