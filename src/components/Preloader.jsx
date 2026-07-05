import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import MovingHeadScene from "./MovingHeadScene";
import "../styles/preloader.css";

export default function Preloader() {
  const location = useLocation();
  const captureMode = new URLSearchParams(window.location.search).get("capturePreloader") === "1";
  const [isMobileVideo, setIsMobileVideo] = useState(() => window.matchMedia?.("(max-width: 680px)")?.matches ?? false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const finishRef = useRef(null);
  const pageLoadedRef = useRef(false);
  const sceneReadyRef = useRef(false);
  const videoRef = useRef(null);
  const useVideoPreloader = !captureMode && !videoError;

  const handleSceneReady = useCallback(() => {
    sceneReadyRef.current = true;
    setSceneReady(true);
    finishRef.current?.();
  }, []);

  useEffect(() => {
    const media = window.matchMedia?.("(max-width: 680px)");
    if (!media) return undefined;
    const update = () => setIsMobileVideo(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const minVisibleMs = 3800;
    const maxVisibleMs = 6800;
    const fadeMs = 120;
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
      const delay = Math.max(0, minVisibleMs - elapsed);

      fadeTimer = window.setTimeout(() => {
        setIsLeaving(true);
        hideTimer = window.setTimeout(() => {
          document.body.classList.remove("preloader-lock");
          performance.mark?.("mb-preloader-end");
          performance.measure?.("mb-preloader-visible", "mb-preloader-start", "mb-preloader-end");
          setIsHidden(true);
        }, fadeMs);
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

    maxTimer = captureMode ? undefined : window.setTimeout(() => finish(true), maxVisibleMs);

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
          ref={videoRef}
          className="site-preloader__video"
          autoPlay
          muted
          playsInline
          preload="auto"
          poster={isMobileVideo ? "/videos/preloader-mobile-poster.jpg" : "/videos/preloader-desktop-poster.jpg"}
          onLoadedData={handleSceneReady}
          onCanPlay={handleSceneReady}
          onError={() => setVideoError(true)}
          aria-hidden="true"
        >
          <source src="/videos/preloader-mobile.mp4" type="video/mp4" media="(max-width: 680px)" />
          <source src="/videos/preloader-desktop.mp4" type="video/mp4" />
          <source src="/videos/preloader-mobile.webm" type="video/webm" media="(max-width: 680px)" />
          <source src="/videos/preloader-desktop.webm" type="video/webm" />
        </video>
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
