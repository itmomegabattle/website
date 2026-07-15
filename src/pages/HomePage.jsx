import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EventList from "../components/EventList";
import heroVideo from "/hero-video.mp4";
import heroVideoMobile from "/hero-video-mobile.mp4";
import heroPoster from "/hero-poster.jpg";
import heroPosterMobile from "/hero-poster-mobile.jpg";
import "../styles/page-home.css";
import Megabattle from "../components/Megabattle";
import Partners from "../components/Partners";
import { Theme } from "../theme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faAt,
} from "@fortawesome/free-solid-svg-icons";
import {
  faVk,
  faTelegram,
  faInstagram,
  faTiktok,
} from "@fortawesome/free-brands-svg-icons";

export default function HomePage() {
  const [theme, setTheme] = useState(Theme.get());
  const [isMobileHero, setIsMobileHero] = useState(false);
  const [activeProjectTab, setActiveProjectTab] = useState(0);
  const [activeContactTab, setActiveContactTab] = useState("card");
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
  const contactTabs = [
    {
      name: "card",
      title: "Визитка",
      shortTitle: "MB",
      className: "contact-tab--card",
    },
    {
      name: "telegram",
      title: "Telegram",
      shortTitle: "TG",
      href: "https://t.me/itmomegabattle",
      handle: "@itmomegabattle",
      meta: "Новости, события и жизнь проекта",
      icon: faTelegram,
      className: "contact-tab--telegram",
    },
    {
      name: "vk",
      title: "ВКонтакте",
      shortTitle: "VK",
      href: "https://vk.com/itmomegabattle",
      handle: "ITMO Megabattle",
      meta: "Официальное сообщество проекта",
      icon: faVk,
      className: "contact-tab--vk",
    },
    {
      name: "instagram",
      title: "Instagram",
      shortTitle: "IG",
      href: "https://www.instagram.com/itmo.megabattle/",
      handle: "itmo.megabattle",
      meta: "Фото, backstage и лица сезона",
      icon: faInstagram,
      className: "contact-tab--instagram",
    },
    {
      name: "tiktok",
      title: "TikTok",
      shortTitle: "TT",
      href: "https://www.tiktok.com/@itmo_megabattle",
      handle: "@itmo_megabattle",
      meta: "Короткие видео и тренды Megabattle",
      icon: faTiktok,
      className: "contact-tab--tiktok",
    },
    {
      name: "rutube",
      title: "Rutube",
      shortTitle: "RU",
      href: "https://rutube.ru/",
      handle: "ITMO Megabattle",
      meta: "Записи концертов и большие видео",
      className: "contact-tab--rutube",
    },
  ];
  const activeContact = contactTabs.find((tab) => tab.name === activeContactTab) || contactTabs[0];

  useEffect(() => {
    Theme.addListener(setTheme, false);
    return () => Theme.removeListener(setTheme);
  }, []);

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
            <video autoPlay muted loop playsInline preload="metadata" poster={isMobileHero ? heroPosterMobile : heroPoster}>
              <source src={heroVideoMobile} media="(max-width: 768px)" type="video/mp4" />
              <source src={heroVideo} type="video/mp4" />
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
            <div className={`contact-info contact-info--${activeContact.name}`}>
              <div className="contact-info__screen" aria-live="polite">
                {activeContact.name === "card" ? (
                  <div className="contact-card">
                    <div className="contact-card__head">
                      <img src="/logo.svg" alt="ITMO Megabattle" width="109" height="67" />
                      <span>Главная визитка</span>
                    </div>
                    <div className="contact-card__body">
                      <p>Факультеты встречаются здесь.</p>
                      <div className="contact-card__details">
                        <div className="contact-line">
                          <FontAwesomeIcon icon={faLocationDot} />
                          <span>Санкт-Петербург, ул. Ломоносова, д. 9</span>
                        </div>
                        <a className="contact-line" href="mailto:megabattle@itmo.ru">
                          <FontAwesomeIcon icon={faAt} />
                          <span>megabattle@itmo.ru</span>
                        </a>
                      </div>
                    </div>
                    <span className="contact-card__mark">ITMO · 2026</span>
                  </div>
                ) : (
                  <div className={`social-profile social-profile--${activeContact.name}`}>
                    <div className="social-profile__chrome">
                      <span className="social-profile__wordmark">{activeContact.title}</span>
                      <span className="social-profile__status">официальный профиль</span>
                    </div>
                    <div className="social-profile__hero">
                      <div className="social-profile__avatar">
                        <img src="/logo.svg" alt="" width="109" height="67" />
                      </div>
                      <div className="social-profile__identity">
                        <span className="social-profile__handle">{activeContact.handle}</span>
                        <strong>ITMO Megabattle <span aria-label="Подтверждено">●</span></strong>
                        <p>{activeContact.meta}</p>
                      </div>
                    </div>
                    <div className="social-profile__metrics">
                      <span><strong>5</strong> мегафаков</span>
                      <span><strong>1</strong> большой сезон</span>
                      <span><strong>∞</strong> знакомств</span>
                    </div>
                    <a className="social-profile__open" href={activeContact.href} target="_blank" rel="noreferrer">
                      Открыть в {activeContact.title}
                    </a>
                  </div>
                )}
              </div>
              <div className="contact-tabs" role="tablist" aria-label="Контакты и социальные сети">
                {contactTabs.map((tab) => (
                  <button
                    key={tab.name}
                    className={`contact-tab ${tab.className}${activeContactTab === tab.name ? " is-active" : ""}`}
                    type="button"
                    role="tab"
                    aria-selected={activeContactTab === tab.name}
                    title={tab.title}
                    onClick={() => setActiveContactTab(tab.name)}
                  >
                    {tab.icon ? <FontAwesomeIcon icon={tab.icon} /> : <span>{tab.shortTitle}</span>}
                    <span className="contact-tab__label">{tab.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
