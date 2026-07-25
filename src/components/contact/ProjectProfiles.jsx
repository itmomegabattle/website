import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAt,
  faBell,
  faCheck,
  faComment,
  faEllipsis,
  faEnvelope,
  faLocationDot,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { ProjectAvatar, SocialScreen } from "./ContactPrimitives";
import { formatSocialStat as stat } from "./contactData";

export function BusinessCard() {
  return (
    <div className="employee-card">
      <div className="employee-card__media">
        <img src="/images/about-image.png" alt="" width="670" height="777" />
        <ProjectAvatar />
      </div>
      <div className="employee-card__profile">
        <span className="employee-card__label">Официальная визитка</span>
        <h2>ITMO<br />Megabattle</h2>
        <p>Команда студенческого проекта, которая собирает людей, факультеты и большую сцену в один сезон.</p>
        <div className="employee-card__contacts">
          <a href="mailto:megabattle@itmo.ru"><FontAwesomeIcon icon={faEnvelope} /><span>megabattle@itmo.ru</span></a>
          <span><FontAwesomeIcon icon={faLocationDot} /><span>Санкт-Петербург<br />Ломоносова, 9</span></span>
          <a href="https://t.me/itmomegabattle" target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faAt} /><span>@itmomegabattle</span></a>
        </div>
        <a className="employee-card__message" href="https://t.me/Arshinovoleg" target="_blank" rel="noreferrer">
          <FontAwesomeIcon icon={faPaperPlane} />
          <span>Написать @Arshinovoleg</span>
        </a>
      </div>
      <div className="employee-card__footer">
        <span>MB · TEAM</span>
        <span>САНКТ-ПЕТЕРБУРГ · 2026</span>
      </div>
    </div>
  );
}

export function TelegramProfile({ data, href }) {
  const actions = [
    { icon: faComment, label: "Чат" },
    { icon: faPaperPlane, label: "Перейти" },
    { icon: faBell, label: "Звук" },
    { icon: faEllipsis, label: "Ещё" },
  ];

  return (
    <SocialScreen className="telegram-screen" href={href}>
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
    </SocialScreen>
  );
}

function VkStat({ value, label }) {
  return <span className="vk-screen__stat"><strong>{value}</strong><small>{label}</small></span>;
}

export function VkProfile({ data, href }) {
  return (
    <SocialScreen className="vk-screen" href={href}>
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
    </SocialScreen>
  );
}
