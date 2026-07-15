import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faTelegram, faTiktok, faVk } from "@fortawesome/free-brands-svg-icons";
import {
  faAt,
  faBell,
  faCheck,
  faEllipsis,
  faEnvelope,
  faLink,
  faLocationDot,
  faPaperPlane,
  faShareNodes,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/contact-showcase.css";

const SOCIALS = [
  { id: "card", label: "Визитка", short: "MB" },
  { id: "telegram", label: "Telegram", icon: faTelegram, href: "https://t.me/itmomegabattle" },
  { id: "vk", label: "ВКонтакте", icon: faVk, href: "https://vk.ru/itmomegabattle" },
  { id: "instagram", label: "Instagram", icon: faInstagram, href: "https://www.instagram.com/itmo.megabattle/" },
  { id: "tiktok", label: "TikTok", icon: faTiktok, href: "https://www.tiktok.com/@itmo_megabattle" },
  { id: "rutube", label: "Rutube", short: "RU", href: "https://rutube.ru/channel/78402593/videos/" },
];

const FALLBACK_STATS = {
  telegram: { followers: 2385 },
  vk: { followers: null },
  instagram: { followers: 1095, posts: null, following: null },
  tiktok: { followers: 169, likes: 1716, posts: 10 },
  rutube: { followers: 206, posts: 15 },
};

const compactNumber = new Intl.NumberFormat("ru-RU", { notation: "compact", maximumFractionDigits: 1 });
const exactNumber = new Intl.NumberFormat("ru-RU");

function stat(value, compact = false) {
  if (!Number.isFinite(value)) return "—";
  return compact ? compactNumber.format(value) : exactNumber.format(value);
}

function ProjectAvatar({ className = "" }) {
  return (
    <span className={`contact-project-avatar ${className}`.trim()}>
      <img src="/logo.svg" alt="" width="109" height="67" />
    </span>
  );
}

function BusinessCard() {
  return (
    <div className="employee-card">
      <div className="employee-card__identity">
        <ProjectAvatar />
        <div>
          <span className="employee-card__label">Официальная визитка</span>
          <h2>ITMO Megabattle</h2>
          <p>Команда студенческого проекта</p>
        </div>
      </div>
      <div className="employee-card__contacts">
        <a href="mailto:megabattle@itmo.ru"><FontAwesomeIcon icon={faEnvelope} /><span>megabattle@itmo.ru</span></a>
        <span><FontAwesomeIcon icon={faLocationDot} /><span>Санкт-Петербург, Ломоносова, 9</span></span>
        <a href="https://t.me/itmomegabattle" target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faAt} /><span>@itmomegabattle</span></a>
      </div>
      <div className="employee-card__footer">
        <span>MEGABATTLE TEAM</span>
        <span>ID · PUBLIC</span>
      </div>
    </div>
  );
}

function TelegramProfile({ data, href }) {
  return (
    <div className="network-screen telegram-screen">
      <div className="telegram-screen__cover" />
      <div className="telegram-screen__bottom">
        <ProjectAvatar />
        <div className="telegram-screen__name">
          <strong>ITMO MEGABATTLE</strong>
          <span>{stat(data.followers)} подписчиков</span>
        </div>
        <a href={href} target="_blank" rel="noreferrer" aria-label="Открыть Telegram"><FontAwesomeIcon icon={faBell} /></a>
        <FontAwesomeIcon icon={faEllipsis} />
      </div>
    </div>
  );
}

function VkProfile({ data, href }) {
  return (
    <div className="network-screen vk-screen">
      <div className="vk-screen__cover">
        <img src="/images/about-image.png" alt="" width="670" height="777" />
        <img className="vk-screen__logo" src="/logo.svg" alt="ITMO Megabattle" width="109" height="67" />
      </div>
      <div className="vk-screen__profile">
        <ProjectAvatar />
        <div className="vk-screen__name">
          <strong>ITMO Megabattle <span><FontAwesomeIcon icon={faCheck} /></span></strong>
          <small>{Number.isFinite(data.followers) ? `${stat(data.followers)} подписчиков` : "Официальное сообщество"}</small>
        </div>
        <a href={href} target="_blank" rel="noreferrer">Сообщение</a>
        <button type="button">Ещё</button>
      </div>
    </div>
  );
}

function InstagramProfile({ data, href }) {
  return (
    <div className="network-screen instagram-screen">
      <div className="instagram-screen__top"><span>‹</span><strong>itmo.megabattle</strong><FontAwesomeIcon icon={faEllipsis} /></div>
      <div className="instagram-screen__profile">
        <ProjectAvatar />
        <div className="instagram-screen__stats">
          <span><strong>{stat(data.posts)}</strong>публикации</span>
          <span><strong>{stat(data.followers, true)}</strong>подписчики</span>
          <span><strong>{stat(data.following)}</strong>подписки</span>
        </div>
      </div>
      <div className="instagram-screen__bio">
        <strong>ITMO Megabattle</strong>
        <span>Major events by the makers at ITMO</span>
        <a href="https://mblinks.online" target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faLink} /> mblinks.online</a>
      </div>
      <div className="instagram-screen__actions">
        <a href={href} target="_blank" rel="noreferrer">Подписаться</a>
        <button type="button">Сообщение</button>
        <button type="button"><FontAwesomeIcon icon={faUserPlus} /></button>
      </div>
    </div>
  );
}

function TiktokProfile({ data, href }) {
  return (
    <div className="network-screen tiktok-screen">
      <ProjectAvatar />
      <div className="tiktok-screen__content">
        <div className="tiktok-screen__title"><strong>ITMO MEGABATTLE</strong><span>|</span><span>itmo_megabattle</span></div>
        <div className="tiktok-screen__stats">
          <span><strong>{stat(data.posts)}</strong> Публикации</span>
          <span><strong>{stat(data.followers)}</strong> Подписчики</span>
          <span><strong>{stat(data.likes)}</strong> Лайки</span>
        </div>
        <div className="tiktok-screen__actions">
          <a href={href} target="_blank" rel="noreferrer">Подписаться</a>
          <button type="button">Сообщение</button>
          <button type="button"><FontAwesomeIcon icon={faUserPlus} /></button>
          <button type="button"><FontAwesomeIcon icon={faShareNodes} /></button>
          <button type="button"><FontAwesomeIcon icon={faEllipsis} /></button>
        </div>
        <p>Major events by the makers at ITMO</p>
        <a className="tiktok-screen__link" href="https://mblinks.online" target="_blank" rel="noreferrer">mblinks.online</a>
      </div>
    </div>
  );
}

function RutubeProfile({ data, href }) {
  return (
    <div className="network-screen rutube-screen">
      <div className="rutube-screen__top"><strong>RUTUBE</strong><span>Канал</span><FontAwesomeIcon icon={faEllipsis} /></div>
      <div className="rutube-screen__cover">
        <img src="/images/about-image.png" alt="" width="670" height="777" />
        <span>ГАЛА-КОНЦЕРТЫ<br />И АРХИВ СЕЗОНОВ</span>
      </div>
      <div className="rutube-screen__profile">
        <ProjectAvatar />
        <div><strong>ITMO MEGABATTLE</strong><span>{stat(data.followers)} подписчиков · {stat(data.posts)} видео</span></div>
        <a href={href} target="_blank" rel="noreferrer">Смотреть канал</a>
      </div>
    </div>
  );
}

export default function ContactShowcase() {
  const [activeTab, setActiveTab] = useState("card");
  const [remoteStats, setRemoteStats] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 6000);

    fetch("/api/social-stats", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => payload?.stats && setRemoteStats(payload.stats))
      .catch(() => {})
      .finally(() => window.clearTimeout(timeout));

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const stats = useMemo(() => {
    return Object.fromEntries(
      Object.entries(FALLBACK_STATS).map(([key, value]) => [key, { ...value, ...(remoteStats?.[key] || {}) }]),
    );
  }, [remoteStats]);

  const activeSocial = SOCIALS.find((item) => item.id === activeTab) || SOCIALS[0];

  return (
    <div className={`contact-showcase contact-info contact-showcase--${activeTab}`}>
      <div className="contact-showcase__screen" role="tabpanel" aria-live="polite">
        {activeTab === "card" && <BusinessCard />}
        {activeTab === "telegram" && <TelegramProfile data={stats.telegram} href={activeSocial.href} />}
        {activeTab === "vk" && <VkProfile data={stats.vk} href={activeSocial.href} />}
        {activeTab === "instagram" && <InstagramProfile data={stats.instagram} href={activeSocial.href} />}
        {activeTab === "tiktok" && <TiktokProfile data={stats.tiktok} href={activeSocial.href} />}
        {activeTab === "rutube" && <RutubeProfile data={stats.rutube} href={activeSocial.href} />}
      </div>
      <div className="contact-tabs" role="tablist" aria-label="Контакты и социальные сети">
        {SOCIALS.map((item) => (
          <button
            className={`contact-tab contact-tab--${item.id}${activeTab === item.id ? " is-active" : ""}`}
            key={item.id}
            type="button"
            role="tab"
            aria-selected={activeTab === item.id}
            aria-label={item.label}
            title={item.label}
            onClick={() => setActiveTab(item.id)}
          >
            {item.icon ? <FontAwesomeIcon icon={item.icon} /> : <span>{item.short}</span>}
            <span className="contact-tab__label">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
