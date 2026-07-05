import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import MovingHeadScene from "./MovingHeadScene";
import "../styles/preloader.css";

export default function Preloader() {
  const location = useLocation();
  const [isLeaving, setIsLeaving] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const finishRef = useRef(null);
  const pageLoadedRef = useRef(false);
  const sceneReadyRef = useRef(false);

  const handleSceneReady = useCallback(() => {
    sceneReadyRef.current = true;
    setSceneReady(true);
    finishRef.current?.();
  }, []);

  useEffect(() => {
    const minVisibleMs = 3000;
    const maxVisibleMs = 5600;
    const fadeMs = 260;
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
    setIsHidden(false);
    setIsLeaving(false);
    document.body.classList.add("preloader-lock");

    const finish = (force = false) => {
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

    maxTimer = window.setTimeout(() => finish(true), maxVisibleMs);

    return () => {
      window.removeEventListener("load", handlePageLoad);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
      window.clearTimeout(maxTimer);
      finishRef.current = null;
      document.body.classList.remove("preloader-lock");
    };
  }, [location.key, location.pathname]);

  if (isHidden) return null;

  return (
    <div className={`site-preloader${isLeaving ? " site-preloader--leaving" : ""}`} aria-live="polite" aria-label="Загрузка ITMO MEGABATTLE">
      <MovingHeadScene onReady={handleSceneReady} />
      <div className="site-preloader__spot" aria-hidden="true" />
      <div className="site-preloader__wash" aria-hidden="true" />
      <div className="site-preloader__content">
        <div className="site-preloader__logo-wrap" aria-hidden="true">
          <img className="site-preloader__logo" src="/logo.svg" width="109" height="67" alt="" />
        </div>
        <span className="site-preloader__sr">ITMO MEGABATTLE</span>
      </div>
    </div>
  );
}
