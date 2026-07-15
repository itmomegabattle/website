import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EventList from "../components/EventList";
import heroVideo from "/hero-video.mp4";
import heroVideoMobile from "/hero-video-mobile.mp4";
import heroPoster from "/hero-poster.jpg";
import heroPosterMobile from "/hero-poster-mobile.jpg";
import aboutImg from "/images/about-image.png";
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
  const isDarkTheme = theme === "dark";
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
          <div className="about-showcase">
            <div className="about-showcase-card about-showcase-card--main">
              <p className="card-kicker">ITMO MEGABATTLE</p>
              <h2>Сезон, где факультеты становятся командами</h2>
              <p>
                Коротко: это большая студенческая экосистема ИТМО — мероприятия,
                знакомства, роли, рейтинги и общий вайб, в котором каждый может
                найти своё место в проекте.
              </p>
              <div className="about-actions">
                <Link className="text-button" to="/history">
                  История проекта
                </Link>
                <a className="ghost-link" href="#events">
                  Ближайшее событие
                </a>
              </div>
            </div>

            <div className="about-showcase-card about-showcase-card--image">
              <img
                src={aboutImg}
                width="670"
                height="777"
                alt="Команда ITMO Megabattle"
                className="about-image"
              />
            </div>

            <div className="about-showcase-card about-showcase-card--stat">
              <span>5</span>
              <p>мегафаков в одной игре</p>
            </div>

            <div className="about-showcase-card about-showcase-card--stat about-showcase-card--blue">
              <span>NFC</span>
              <p>визитки, профили и граф знакомств</p>
            </div>

            <div className="about-showcase-card about-showcase-card--wide">
              <p>
                Проект вырос из традиций “Весны в ИТМО” и “Я первокурсник”,
                но теперь живёт как отдельная система: от концертов и квизов до
                личных профилей, партнёрских событий и будущей админки.
              </p>
            </div>
          </div>
        </section>

        <section id="events" className="events main-width">
          <h1>СОБЫТИЯ</h1>
          <div className="home-event-head">
            <p className="card-kicker">Ближайшая точка входа</p>
            <p>
              Первое мероприятие из общей секции — с описанием, местом, временем
              и кнопкой регистрации, если она уже открыта.
            </p>
          </div>
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
