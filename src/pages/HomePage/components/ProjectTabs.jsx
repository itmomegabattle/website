import { useState } from "react";
import ActionLink from "../../../common/components/ActionLink";
import Card from "../../../common/components/Card";
import "./project-tabs.css";

const projectTabs = [
  {
    number: "01",
    title: "Что это?",
    text: [
      "ITMO.Megabattle — проект, созданный студентами для студентов. С 2018 года он объединяет мегафакультеты ИТМО, сохраняет университетские традиции и создаёт новые.",
      "Как проект вырос из наследия Студвесны и менялся от сезона к сезону, рассказывает раздел «История». Прошлое своего мегафакультета можно изучить в ретро-блоке факультетов, а зарегистрироваться на ближайшие события — в разделе мероприятий.",
    ],
    links: [
      { to: "/history", label: "История" },
      { to: "/faculties", label: "Ретро факультетов" },
      { to: "/events", label: "Мероприятия" },
    ],
  },
  {
    number: "02",
    title: "Что я буду делать?",
    text: [
      "Каждый участник может найти занятие по интересам и навыкам: выходить на сцену, снимать и монтировать, создавать костюмы и декорации, работать со светом, звуком, дизайном, медиа или организацией.",
      "В проекте более 50 ролей, и с каждым сезоном появляются новые. Megabattle устроен так, что вклад каждого человека влияет на общий результат — подробнее о направлениях работы можно узнать в разделе «Роли».",
    ],
    links: [{ to: "/history#roles", label: "Посмотреть роли" }],
  },
  {
    number: "03",
    title: "Как попасть?",
    text: [
      "Если ты ещё не знаешь свой мегафакультет, открой страницу факультетов: там собраны инфографика, структура университета, образовательные программы и поиск по названиям и сокращениям.",
      "Чтобы попасть в актив, достаточно написать ответственному своего факультета. Можно сразу рассказать, что тебе интересно, или просто прийти познакомиться — подходящую роль помогут найти вместе.",
    ],
    links: [
      { to: "/people?team=responsible#team", label: "Ответственные в команде" },
      { to: "/faculties", label: "Найти факультет" },
    ],
  },
  {
    number: "04",
    title: "Что-то ещё?",
    text: [
      "У участников проекта остаются истории и воспоминания — они собраны на отдельной странице, которую можно дополнять новыми рассказами.",
      "С сезона 2026/27 у проекта работает собственный сайт с личным кабинетом. Здесь развиваются профиль, рейтинг и игровые механики, а NFC-карту или брелок можно привязать к визитке, знакомиться с участниками и вместе строить граф связей.",
    ],
    links: [
      { to: "/ratings", label: "Открыть профиль" },
      { to: "/people#connections", label: "Граф знакомств" },
      { to: "/people#stories", label: "Истории участников" },
    ],
  },
];

export default function ProjectTabs() {
  const [activeTab, setActiveTab] = useState(0);
  const active = projectTabs[activeTab];

  return (
    <Card className="project-menu" aria-label="Навигация по проекту">
      <div className="project-menu__nav" role="tablist" aria-label="О проекте">
        {projectTabs.map((item, index) => (
          <button
            className={`project-menu__trigger${activeTab === index ? " is-active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activeTab === index}
            aria-controls="project-panel"
            onClick={() => setActiveTab(index)}
            key={item.title}
          >
            <span className="project-menu__number">{item.number}</span>
            <span className="project-menu__title">{item.title}</span>
          </button>
        ))}
      </div>
      <div className="project-menu__panel" id="project-panel" role="tabpanel" aria-live="polite">
        <h2 className="card-title">{active.title}</h2>
        <div className="project-menu__text">
          {active.text.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <div className="project-menu__actions">
          {active.links.map((link) => (
            <ActionLink to={link.to} key={link.to}>
              {link.label}
            </ActionLink>
          ))}
        </div>
      </div>
    </Card>
  );
}
