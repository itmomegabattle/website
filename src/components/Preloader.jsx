import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Megabattle from "./Megabattle";
import "../styles/preloader.css";

export default function Preloader() {
  const location = useLocation();
  const [isLeaving, setIsLeaving] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const isInitialLoad = !window.__mbPreloaderSeen;
    window.__mbPreloaderSeen = true;
    const minVisibleMs = isInitialLoad ? 3000 : 900;
    const fadeMs = 760;
    const startedAt = performance.now();
    let fadeTimer;
    let hideTimer;

    performance.mark?.("mb-preloader-start");
    setIsHidden(false);
    setIsLeaving(false);
    document.body.classList.add("preloader-lock");

    const finish = () => {
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

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
    }

    return () => {
      window.removeEventListener("load", finish);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
      document.body.classList.remove("preloader-lock");
    };
  }, [location.key, location.pathname]);

  if (isHidden) return null;

  return (
    <div className={`site-preloader${isLeaving ? " site-preloader--leaving" : ""}`} aria-live="polite" aria-label="Загрузка ITMO MEGABATTLE">
      <div className="site-preloader__content">
        <div className="site-preloader__logo-wrap" aria-hidden="true">
          <Megabattle className="site-preloader__logo site-preloader__logo--base" />
          <Megabattle className="site-preloader__logo site-preloader__logo--light" />
        </div>
        <span className="site-preloader__sr">ITMO MEGABATTLE</span>
      </div>
    </div>
  );
}
