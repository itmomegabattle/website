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
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

export default function HomePage() {
  const [theme, setTheme] = useState(Theme.get());
  const [isMobileHero, setIsMobileHero] = useState(false);
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
  const contactSocials = [
    {
      name: "VK",
      title: "ВКонтакте",
      href: "https://vk.com/itmomegabattle",
      icon: faVk,
      className: "contact-social--vk",
    },
    {
      name: "TG",
      title: "Telegram",
      href: "https://t.me/itmomegabattle",
      icon: faTelegram,
      className: "contact-social--telegram",
    },
    {
      name: "YT",
      title: "YouTube",
      href: "https://www.youtube.com/@itmomegabattle",
      icon: faYoutube,
      className: "contact-social--youtube",
    },
    {
      name: "IG",
      title: "Instagram",
      href: "https://www.instagram.com/itmo.megabattle/",
      icon: faInstagram,
      className: "contact-social--instagram",
    },
    {
      name: "TT",
      title: "TikTok",
      href: "https://www.tiktok.com/@itmo_megabattle",
      icon: faTiktok,
      className: "contact-social--tiktok",
    },
  ];

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
            {projectTabs.map((item, index) => (
              <div
                className={`project-menu__item project-menu__item--${index + 1}${
                  activeProjectTab === index ? " is-active" : ""
                }`}
                key={item.title}
              >
                <button
                  className="project-menu__trigger"
                  type="button"
                  aria-expanded={activeProjectTab === index}
                  aria-controls={`project-answer-${index}`}
                  onClick={() => setActiveProjectTab(index)}
                >
                  <span className="project-menu__number">{item.number}</span>
                  <span className="project-menu__title">{item.title}</span>
                  <span className="project-menu__indicator" aria-hidden="true" />
                </button>
                <div
                  className="project-menu__answer"
                  id={`project-answer-${index}`}
                  aria-hidden={activeProjectTab !== index}
                >
                  <div className="project-menu__answer-inner">
                    <div className="project-menu__tags">
                      {item.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <p className="project-menu__text">{item.text}</p>
                    <Link className="project-menu__cta" to={item.to}>
                      {item.cta}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
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
            <div className="contact-info">
              <div className="contact-info-main">
                <div className="contact-line">
                  <FontAwesomeIcon icon={faLocationDot} />
                  <span>ул. Ломоносова, д.9</span>
                </div>
                <div className="contact-line">
                  <FontAwesomeIcon icon={faAt} />
                  <span>megabattle@itmo.ru</span>
                </div>
              </div>

              <div className="contact-socials-panel" aria-label="Социальные сети">
                {contactSocials.map((social, index) => (
                  <a
                    key={social.name}
                    className={`contact-social-link ${social.className}`}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    title={social.title}
                    aria-label={social.title}
                  >
                    <FontAwesomeIcon icon={social.icon} />
                    <span>{social.title}</span>
                  </a>
                ))}
              </div>
              {/* <button
                className="button"
                type="button"
                onClick={() =>
                  // todo: он строит маршрут к черному ходу, а не к основному
                  window.open(
                    "https://yandex.ru/maps/?rtext=~59.926503,30.338712&rtt=auto",
                    "_blank",
                  )
                }
              >
                Построить маршрут
              </button> */}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
