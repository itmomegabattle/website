import { useEffect, useState } from "react";
import "../styles/preloader.css";

const LETTERS = "ITMO MEGABATTLE".split("");

export default function Preloader() {
  const [isLeaving, setIsLeaving] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const minVisibleMs = 1850;
    const fadeMs = 620;
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
      <div className="site-preloader__halo" />
      <div className="site-preloader__beam" />
      <div className="site-preloader__content">
        <p className="site-preloader__eyebrow">loading</p>
        <div className="site-preloader__title" aria-hidden="true">
          {LETTERS.map((letter, index) => (
            <span
              className={letter === " " ? "site-preloader__space" : ""}
              style={{ "--letter-index": index }}
              key={`${letter}-${index}`}
            >
              {letter === " " ? "\u00a0" : letter}
            </span>
          ))}
        </div>
        <span className="site-preloader__sr">ITMO MEGABATTLE</span>
        <div className="site-preloader__line">
          <span />
        </div>
      </div>
    </div>
  );
}
