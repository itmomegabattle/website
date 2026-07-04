import { useEffect, useState } from "react";
import Megabattle from "./Megabattle";
import "../styles/preloader.css";

export default function Preloader() {
  const [isLeaving, setIsLeaving] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const minVisibleMs = 3000;
    const fadeMs = 760;
    const startedAt = performance.now();
    let fadeTimer;
    let hideTimer;

    document.body.classList.add("preloader-lock");

    const finish = () => {
      const elapsed = performance.now() - startedAt;
      const delay = Math.max(0, minVisibleMs - elapsed);

      fadeTimer = window.setTimeout(() => {
        setIsLeaving(true);
        hideTimer = window.setTimeout(() => {
          document.body.classList.remove("preloader-lock");
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
  }, []);

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
