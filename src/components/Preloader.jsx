import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import MovingHeadScene from "./MovingHeadScene";
import "../styles/preloader.css";

const PRELOADER_VIDEO_DURATION_MS = 3800;
const PRELOADER_MAX_VISIBLE_MS = PRELOADER_VIDEO_DURATION_MS + 3000;
const PRELOADER_FADE_MS = 120;
const MOBILE_PRELOADER_QUERY = "(max-width: 680px)";

export default function Preloader() {
  const location = useLocation();
  const captureMode = new URLSearchParams(window.location.search).get("capturePreloader") === "1";
  const [isMobileVideo, setIsMobileVideo] = useState(() => window.matchMedia?.(MOBILE_PRELOADER_QUERY)?.matches ?? false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const finishRef = useRef(null);
  const pageLoadedRef = useRef(false);
  const sceneReadyRef = useRef(false);
  const videoRef = useRef(null);
  const useVideoPreloader = !captureMode && !videoError;
  const preloaderVideoSrc = isMobileVideo ? "/videos/preloader-mobile.mp4" : "/videos/preloader-desktop.mp4";
  const preloaderPosterSrc = isMobileVideo ? "/videos/preloader-mobile-poster.jpg" : "/videos/preloader-desktop-poster.jpg";

  const handleSceneReady = useCallback(() => {
    sceneReadyRef.current = true;
    setSceneReady(true);
    finishRef.current?.();
  }, []);

  useEffect(() => {
    const media = window.matchMedia?.(MOBILE_PRELOADER_QUERY);
    if (!media) return undefined;
    const update = () => setIsMobileVideo(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const startedAt = performance.now();
    let fadeTimer;
    let hideTimer;
    let maxTimer;
    let isFinished = false;

    performance.mark?.("mb-preloader-start");
    sceneReadyRef.current = false;
    pageLoadedRef.current = document.readyState === "complete";
    finishRef.current = null;
    setSceneReady(false);
    setVideoError(false);
    setIsHidden(false);
    setIsLeaving(false);
    document.body.classList.add("preloader-lock");

    const finish = (force = false) => {
      if (captureMode) return;
      if (isFinished) return;
      if (!force && (!pageLoadedRef.current || !sceneReadyRef.current)) return;
      isFinished = true;
      const elapsed = performance.now() - startedAt;
      const delay = Math.max(0, PRELOADER_VIDEO_DURATION_MS - elapsed);

      fadeTimer = window.setTimeout(() => {
        setIsLeaving(true);
        hideTimer = window.setTimeout(() => {
          document.body.classList.remove("preloader-lock");
          performance.mark?.("mb-preloader-end");
          performance.measure?.("mb-preloader-visible", "mb-preloader-start", "mb-preloader-end");
          setIsHidden(true);
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

    maxTimer = captureMode ? undefined : window.setTimeout(() => finish(true), PRELOADER_MAX_VISIBLE_MS);

    return () => {
      window.removeEventListener("load", handlePageLoad);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
      window.clearTimeout(maxTimer);
      finishRef.current = null;
      document.body.classList.remove("preloader-lock");
    };
  }, [location.key, location.pathname]);

  useEffect(() => {
    if (!useVideoPreloader) return undefined;
    const video = videoRef.current;
    if (!video) return undefined;
    video.currentTime = 0;
    const playPromise = video.play?.();
    playPromise?.catch?.(() => {
      setVideoError(true);
    });
    return undefined;
  }, [location.key, location.pathname, useVideoPreloader]);

  if (isHidden) return null;

  return (
    <div className={`site-preloader${isLeaving ? " site-preloader--leaving" : ""}`} aria-live="polite" aria-label="Загрузка ITMO MEGABATTLE">
      {useVideoPreloader ? (
        <video
          key={`${location.key}-${preloaderVideoSrc}`}
          ref={videoRef}
          className="site-preloader__video"
          src={preloaderVideoSrc}
          autoPlay
          muted
          playsInline
          preload="auto"
          poster={preloaderPosterSrc}
          onLoadedData={handleSceneReady}
          onCanPlay={handleSceneReady}
          onError={() => setVideoError(true)}
          aria-hidden="true"
        />
      ) : (
        <>
          <MovingHeadScene onReady={handleSceneReady} />
          <div className="site-preloader__spot" aria-hidden="true" />
          <div className="site-preloader__wash" aria-hidden="true" />
          <div className="site-preloader__content">
            <div className="site-preloader__logo-wrap" aria-hidden="true">
              <img className="site-preloader__logo" src="/logo.svg" width="109" height="67" alt="" />
            </div>
            <span className="site-preloader__sr">ITMO MEGABATTLE</span>
          </div>
        </>
      )}
      {useVideoPreloader ? (
        <div className="site-preloader__video-fallback" aria-hidden="true">
          <img src="/logo.svg" width="109" height="67" alt="" />
        </div>
      ) : null}
    </div>
  );
}
