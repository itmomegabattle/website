import { useEffect, useRef, useState } from "react";
import EventList from "./components/EventList";
import ProjectTabs from "./components/ProjectTabs";
import heroVideo from "/hero-video.mp4";
import heroVideoMobile from "/hero-video-mobile.mp4";
import heroPoster from "/hero-poster.webp";
import heroPosterMobile from "/hero-poster-mobile.webp";
import "./home-page.css";
import Megabattle from "./components/Megabattle";
import Partners from "./components/Partners";
import ContactShowcase from "./components/ContactShowcase";
import {
  hasSeenPreloader,
  PRELOADER_FINISHED_EVENT,
} from "../../common/components/Preloader";
import { Theme } from "../../theme";

export default function HomePage() {
  const [theme, setTheme] = useState(Theme.get());
  const [isMobileHero, setIsMobileHero] = useState(
    () => window.matchMedia?.("(max-width: 768px)")?.matches ?? false,
  );
  const [allowHeroVideo] = useState(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return !connection?.saveData && !window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  });
  const [preloaderFinished, setPreloaderFinished] = useState(() => hasSeenPreloader());
  const heroVideoRef = useRef(null);
  const isDarkTheme = theme === "dark";
  const shouldPlayHeroVideo = allowHeroVideo && preloaderFinished;

  useEffect(() => {
    Theme.addListener(setTheme, false);
    return () => Theme.removeListener(setTheme);
  }, []);

  useEffect(() => {
    if (preloaderFinished) return undefined;
    const handlePreloaderFinished = () => setPreloaderFinished(true);
    window.addEventListener(PRELOADER_FINISHED_EVENT, handlePreloaderFinished, { once: true });
    return () => window.removeEventListener(PRELOADER_FINISHED_EVENT, handlePreloaderFinished);
  }, [preloaderFinished]);

  useEffect(() => {
    const video = heroVideoRef.current;
    const clearHeroCover = () => {
      delete document.body.dataset.heroCoverActive;
    };

    if (!video || !shouldPlayHeroVideo) {
      video?.pause();
      clearHeroCover();
      return clearHeroCover;
    }

    let intersectionRatio = 1;

    const updatePlayback = () => {
      const isVisible = intersectionRatio > 0.08;
      const coversViewport = !document.hidden && intersectionRatio >= 0.55;
      document.body.dataset.heroCoverActive = coversViewport ? "true" : "false";

      if (document.hidden || !isVisible) video.pause();
      else video.play().catch(() => null);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        intersectionRatio = entry.isIntersecting ? entry.intersectionRatio : 0;
        updatePlayback();
      },
      { threshold: [0, 0.08, 0.55, 0.8] },
    );
    const handleVisibility = () => updatePlayback();
    observer.observe(video);
    document.addEventListener("visibilitychange", handleVisibility);
    updatePlayback();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      clearHeroCover();
    };
  }, [shouldPlayHeroVideo]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const updateHeroMode = () => setIsMobileHero(mediaQuery.matches);
    updateHeroMode();
    mediaQuery.addEventListener("change", updateHeroMode);
    return () => mediaQuery.removeEventListener("change", updateHeroMode);
  }, []);

  const mapSrc = `https://yandex.ru/map-widget/v1/org/itmo_university/1536000555/?ll=30.338712%2C59.926503&z=15${
    isDarkTheme ? "&theme=dark" : "&theme=light"
  }`;

  return (
    <>
      <main>
        <section className="hero" id="home">
          <div className="video-background">
            <video
              ref={heroVideoRef}
              autoPlay={shouldPlayHeroVideo}
              muted
              loop
              playsInline
              preload={shouldPlayHeroVideo ? "metadata" : "none"}
              poster={isMobileHero ? heroPosterMobile : heroPoster}
            >
              {shouldPlayHeroVideo && (
                <>
                  <source src={heroVideoMobile} media="(max-width: 768px)" type="video/mp4" />
                  <source src={heroVideo} type="video/mp4" />
                </>
              )}
            </video>
          </div>
          <div className="hero-content">
            <Megabattle className="hero-title" />
          </div>
        </section>

        <section id="about" className="about main-width">
          <h1>ПРОЕКТ</h1>
          <ProjectTabs />
        </section>

        <section id="events" className="events events-page main-width">
          <h1>СОБЫТИЯ</h1>
          <EventList />
        </section>

        <section id="partners" className="partners">
          <h1>ПАРТНЕРЫ</h1>
          <Partners />
        </section>

        <section id="contacts" className="contacts main-width">
          <h1>КОНТАКТЫ</h1>
          <div className="contacts-container">
            <ContactShowcase />
          </div>
        </section>
      </main>
    </>
  );
}
