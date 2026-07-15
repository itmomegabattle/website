import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faTelegram, faTiktok, faVk } from "@fortawesome/free-brands-svg-icons";
import {
  faAt,
  faBell,
  faCheck,
  faComment,
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
  instagram: {
    followers: 1095,
    posts: 115,
    following: 4,
    media: ["/images/about-image.png", "/images/events/event1.jpg", "/images/events/event2.jpg"],
  },
  tiktok: { followers: 169, likes: 1716, posts: 10 },
  rutube: {
    followers: 206,
    posts: 15,
    videos: [
      {
        title: "ITMO MEGABATTLE 8 сезон 2 раунд",
        thumbnail: "/images/about-image.png",
        url: "https://rutube.ru/channel/78402593/videos/",
      },
      {
        title: "ITMO MEGABATTLE 8 сезон 1 раунд",
        thumbnail: "/images/events/event1.jpg",
        url: "https://rutube.ru/channel/78402593/videos/",
      },
      {
        title: "Гала-концерт ITMO MEGABATTLE",
        thumbnail: "/images/events/event2.jpg",
        url: "https://rutube.ru/channel/78402593/videos/",
      },
    ],
  },
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
      <div className="employee-card__brand">
        <ProjectAvatar />
        <span>MEGABATTLE</span>
      </div>
      <div className="employee-card__profile">
        <span className="employee-card__label">Официальная визитка</span>
        <h2>ITMO<br />Megabattle</h2>
        <p>Команда студенческого проекта</p>
        <div className="employee-card__contacts">
          <a href="mailto:megabattle@itmo.ru"><FontAwesomeIcon icon={faEnvelope} /><span>megabattle@itmo.ru</span></a>
          <span><FontAwesomeIcon icon={faLocationDot} /><span>Санкт-Петербург<br />Ломоносова, 9</span></span>
          <a href="https://t.me/itmomegabattle" target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faAt} /><span>@itmomegabattle</span></a>
        </div>
      </div>
      <div className="employee-card__footer">
        <span>MB · TEAM</span>
        <span>САНКТ-ПЕТЕРБУРГ · 2026</span>
      </div>
    </div>
  );
}

function TelegramProfile({ data, href }) {
  const actions = [
    { icon: faComment, label: "Чат" },
    { icon: faPaperPlane, label: "Перейти" },
    { icon: faBell, label: "Звук" },
    { icon: faEllipsis, label: "Ещё" },
  ];

  return (
    <div className="network-screen telegram-screen">
      <div className="telegram-screen__hero">
        <ProjectAvatar />
        <strong>ITMO Megabattle</strong>
        <span>{stat(data.followers)} подписчиков</span>
      </div>
      <div className="telegram-screen__actions">
        {actions.map((action) => (
          <a key={action.label} href={href} target="_blank" rel="noreferrer">
            <FontAwesomeIcon icon={action.icon} />
            <span>{action.label}</span>
          </a>
        ))}
      </div>
      <a className="telegram-screen__info" href={href} target="_blank" rel="noreferrer">
        <span>Информация</span>
        <p>Добро пожаловать в информационный канал проекта ITMO Megabattle 💙</p>
        <div><small>ССЫЛКА</small><strong>@itmomegabattle</strong></div>
      </a>
    </div>
  );
}

function VkStat({ value, label }) {
  return (
    <span className="vk-screen__stat">
      <strong>{value}</strong>
      <small>{label}</small>
    </span>
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
          <small>@itmomegabattle</small>
          <div className="vk-screen__stats">
            <VkStat value={stat(data.followers)} label="подписчиков" />
            <VkStat value="ИТМО" label="сообщество" />
            <VkStat value="СПб" label="город" />
          </div>
        </div>
        <a href={href} target="_blank" rel="noreferrer">Сообщение</a>
        <a className="vk-screen__more" href={href} target="_blank" rel="noreferrer">Ещё</a>
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
      <div className="instagram-screen__media">
        {(data.media || []).slice(0, 3).map((image, index) => (
          <a href={href} target="_blank" rel="noreferrer" key={`${image}-${index}`}>
            <img src={image} alt={`Публикация ITMO Megabattle ${index + 1}`} loading="lazy" />
          </a>
        ))}
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
          <a href={href} target="_blank" rel="noreferrer">Сообщение</a>
          <a href={href} target="_blank" rel="noreferrer" aria-label="Добавить в TikTok"><FontAwesomeIcon icon={faUserPlus} /></a>
          <a href={href} target="_blank" rel="noreferrer" aria-label="Поделиться TikTok"><FontAwesomeIcon icon={faShareNodes} /></a>
          <a href={href} target="_blank" rel="noreferrer" aria-label="Открыть TikTok"><FontAwesomeIcon icon={faEllipsis} /></a>
        </div>
        <p>Major events by the makers at ITMO</p>
        <a className="tiktok-screen__link" href="https://mblinks.online" target="_blank" rel="noreferrer">mblinks.online</a>
      </div>
    </div>
  );
}

function RutubeProfile({ data, href }) {
  const videos = (data.videos || []).slice(0, 3);

  return (
    <div className="network-screen rutube-screen">
      <div className="rutube-screen__top">
        <strong>RUTUBE</strong>
        <a href={href} target="_blank" rel="noreferrer">Открыть канал</a>
      </div>
      <div className="rutube-screen__profile">
        <ProjectAvatar />
        <div><strong>ITMO MEGABATTLE</strong><span>{stat(data.followers)} подписчиков · {stat(data.posts)} видео</span></div>
      </div>
      <div className="rutube-screen__videos">
        {videos.map((video, index) => (
          <a href={video.url || href} target="_blank" rel="noreferrer" key={`${video.url}-${index}`}>
            <span className="rutube-screen__thumbnail">
              <img src={video.thumbnail} alt="" loading="lazy" />
              <i>▶</i>
            </span>
            <strong>{video.title}</strong>
          </a>
        ))}
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
