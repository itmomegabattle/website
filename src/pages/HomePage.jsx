import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import EventList from "../components/EventList";
import heroVideo from "/hero-video.mp4";
import heroVideoMobile from "/hero-video-mobile.mp4";
import heroPoster from "/hero-poster.webp";
import heroPosterMobile from "/hero-poster-mobile.webp";
import "../styles/page-home.css";
import Megabattle from "../components/Megabattle";
import Partners from "../components/Partners";
import ContactShowcase from "../components/ContactShowcase";
import {
  hasSeenPreloader,
  PRELOADER_FINISHED_EVENT,
} from "../components/Preloader";
import { Theme } from "../theme";

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
  const [activeProjectTab, setActiveProjectTab] = useState(0);
  const isDarkTheme = theme === "dark";
  const shouldPlayHeroVideo = allowHeroVideo && preloaderFinished;
  const projectTabs = [
    {
      number: "01",
      title: "Что это?",
      text: "Megabattle — большой творческий сезон ИТМО, в котором мегафакультеты знакомятся, соревнуются, делают события и собирают сценические номера. Посмотри, как проект рос от первого сезона до сегодняшнего дня.",
      tags: ["творческий сезон", "5 мегафакультетов", "история проекта"],
      links: [
        { to: "/history", label: "История" },
        { to: "/faculties", label: "Ретро факультетов" },
        { to: "/events", label: "Мероприятия" },
      ],
    },
    {
      number: "02",
      title: "Что я буду делать?",
      text: "Выходить на сцену, снимать и монтировать, придумывать костюмы и декорации, работать со светом, звуком, дизайном, SMM или организацией. А ближайшие точки входа всегда появляются в афише.",
      tags: ["сцена", "медиа", "техника и организация"],
      links: [{ to: "/history#roles", label: "Посмотреть роли" }],
    },
    {
      number: "03",
      title: "Как попасть?",
      text: "Найди свой мегафакультет, открой раздел участника и следи за ближайшими наборами. Можно прийти в команду факультета, откликнуться на роль или начать со знакомства на открытом событии.",
      tags: ["найти факультет", "выбрать роль", "прийти на событие"],
      links: [
        { to: "/people?team=responsible#team", label: "Ответственные в команде" },
        { to: "/faculties", label: "Найти факультет" },
      ],
    },
    {
      number: "04",
      title: "Что-то ещё?",
      text: "Личный кабинет участника собирает рейтинг, прогресс, игровые достижения, профиль и твои метки в одном месте.",
      links: [
        { to: "/ratings", label: "Открыть профиль" },
        { to: "/people#connections", label: "Граф знакомств" },
        { to: "/people#stories", label: "Истории участников" },
      ],
    },
  ];

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
          <div className="project-menu" aria-label="Навигация по проекту">
            <div className="project-menu__nav" role="tablist" aria-label="О проекте">
              {projectTabs.map((item, index) => (
                <button
                  className={`project-menu__trigger${activeProjectTab === index ? " is-active" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={activeProjectTab === index}
                  aria-controls="project-panel"
                  onClick={() => setActiveProjectTab(index)}
                  key={item.title}
                >
                  <span className="project-menu__number">{item.number}</span>
                  <span className="project-menu__title">{item.title}</span>
                </button>
              ))}
            </div>
            <div className="project-menu__panel" id="project-panel" role="tabpanel" aria-live="polite">
              <h2>{projectTabs[activeProjectTab].title}</h2>
              <p className="project-menu__text">{projectTabs[activeProjectTab].text}</p>
              <div className="project-menu__actions">
                {projectTabs[activeProjectTab].links.map((link) => (
                  <Link className="project-menu__cta" to={link.to} key={link.to}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
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
