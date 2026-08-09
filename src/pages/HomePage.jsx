import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import EventList from "../components/EventList";
import heroVideo from "/hero-video.mp4";
import heroVideoMobile from "/hero-video-mobile.mp4";
import heroVideoAv1 from "/hero-video-av1.webm";
import heroVideoMobileAv1 from "/hero-video-mobile-av1.webm";
import heroPoster from "/hero-poster.webp";
import heroPosterMobile from "/hero-poster-mobile.webp";
import "../styles/page-home.css";
import Megabattle from "../components/Megabattle";
import Partners from "../components/Partners";
import ContactShowcase from "../components/ContactShowcase";
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
  const heroVideoRef = useRef(null);
  const [activeProjectTab, setActiveProjectTab] = useState(0);
  const isDarkTheme = theme === "dark";
  const projectTabs = [
    {
      number: "01",
      title: "История",
      text: "Megabattle объединяет факультеты ИТМО в одном большом сезоне: от первых встреч и отборов до финального гала-концерта. В истории собраны ключевые этапы проекта, архив событий и ретроспектива прошлых сезонов.",
      tags: ["о проекте", "ретроспектива", "архив сезонов"],
      to: "/history",
      cta: "Перейти к истории",
    },
    {
      number: "02",
      title: "Команда",
      text: "За сезоном стоят организаторы, ответственные направлений и большая команда участников. Здесь можно познакомиться с теми, кто собирает мероприятия, отвечает за сцену, медиа, партнёров и внутреннюю жизнь проекта.",
      tags: ["организаторы", "ответственные", "команда"],
      to: "/people",
      cta: "Смотреть команду",
    },
    {
      number: "03",
      title: "Роли",
      text: "В проекте можно найти место на сцене или за ней: заниматься постановкой, техникой, реквизитом, дизайном, SMM и организацией. Раздел поможет понять направления работы и выбрать свою точку входа.",
      tags: ["сцена", "медиа", "организация"],
      to: "/ratings",
      cta: "К участникам",
    },
    {
      number: "04",
      title: "Факультеты",
      text: "Пять мегафакультетов собирают студентов разных образовательных программ в команды. На интерактивной карте можно увидеть их структуру, направления и понять, к какой команде относится твой факультет.",
      tags: ["5 мегафакультетов", "направления", "карта"],
      to: "/faculties",
      cta: "Открыть карту",
    },
  ];

  useEffect(() => {
    Theme.addListener(setTheme, false);
    return () => Theme.removeListener(setTheme);
  }, []);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video || !allowHeroVideo) return undefined;

    const updatePlayback = (isVisible = true) => {
      if (document.hidden || !isVisible) video.pause();
      else video.play().catch(() => null);
    };
    const observer = new IntersectionObserver(
      ([entry]) => updatePlayback(entry.isIntersecting),
      { threshold: 0.08 },
    );
    const handleVisibility = () => updatePlayback(video.getBoundingClientRect().bottom > 0);
    observer.observe(video);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [allowHeroVideo]);

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
              autoPlay={allowHeroVideo}
              muted
              loop
              playsInline
              preload={allowHeroVideo ? "metadata" : "none"}
              poster={isMobileHero ? heroPosterMobile : heroPoster}
            >
              {allowHeroVideo && (
                <>
                  <source src={heroVideoMobileAv1} media="(max-width: 768px)" type='video/webm; codecs="av01.0.08M.08"' />
                  <source src={heroVideoAv1} type='video/webm; codecs="av01.0.08M.08"' />
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
              <span className="project-menu__eyebrow">{projectTabs[activeProjectTab].number} / О проекте</span>
              <h2>{projectTabs[activeProjectTab].title}</h2>
              <div className="project-menu__tags">
                {projectTabs[activeProjectTab].tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <p className="project-menu__text">{projectTabs[activeProjectTab].text}</p>
              <Link className="project-menu__cta" to={projectTabs[activeProjectTab].to}>
                {projectTabs[activeProjectTab].cta}
              </Link>
            </div>
          </div>
        </section>

        <section id="events" className="events main-width">
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
            <iframe className="yandex-map" title="Карта ИТМО" src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade">
              Карта ИТМО
            </iframe>
            <ContactShowcase />
          </div>
        </section>
      </main>
    </>
  );
}
