import { useMemo, useState } from "react";
import "../styles/role-map.css";

const roleTracks = [
  {
    id: "stage",
    title: "Сцена",
    accent: "#8EA8FF",
    description: "Всё, что зритель видит в номере: идея, движение, актёры и финальная постановка.",
    roles: [
      {
        id: "actor",
        title: "Актёр",
        level: "вход",
        tasks: "Выходит на сцену, держит образ, работает с партнёрами и ритмом номера.",
        skills: ["сценическая смелость", "пластика", "командность"],
        next: "Постановщик / Режиссёр",
      },
      {
        id: "choreo",
        title: "Постановщик",
        level: "специализация",
        tasks: "Собирает движения, рисунок сцены, переходы и репетиционную механику.",
        skills: ["ритм", "композиция", "репетиции"],
        next: "Режиссёр номера",
      },
      {
        id: "director",
        title: "Режиссёр",
        level: "лидер",
        tasks: "Держит идею номера целиком: драматургию, темп, акценты, финальный вау-эффект.",
        skills: ["видение", "лидерство", "сборка смыслов"],
        next: "Креативный продюсер",
      },
    ],
  },
  {
    id: "production",
    title: "Продакшн",
    accent: "#FF5FB7",
    description: "Материальный мир выступления: реквизит, костюмы, сцена, свет, звук и безопасность.",
    roles: [
      {
        id: "props",
        title: "Реквизитер",
        level: "вход",
        tasks: "Ищет, делает, подписывает, хранит и вовремя выносит реквизит.",
        skills: ["аккуратность", "смекалка", "тайминг"],
        next: "Декоратор / Техкоординатор",
      },
      {
        id: "costume",
        title: "Костюмер",
        level: "специализация",
        tasks: "Собирает визуал персонажей: одежду, быстрые переодевания, целостность образа.",
        skills: ["вкус", "логистика", "детали"],
        next: "Художник по образам",
      },
      {
        id: "tech",
        title: "Техкоординатор",
        level: "лидер",
        tasks: "Связывает свет, звук, реквизит, сцену и людей в один рабочий план.",
        skills: ["системность", "коммуникация", "антикризис"],
        next: "Технический продюсер",
      },
    ],
  },
  {
    id: "media",
    title: "Медиа",
    accent: "#55E39B",
    description: "То, как проект звучит и выглядит вне сцены: соцсети, фото, видео, дизайн, тексты.",
    roles: [
      {
        id: "smm",
        title: "СММ",
        level: "вход",
        tasks: "Ведёт соцсети, ловит инфоповоды, превращает хаос репетиций в живой контент.",
        skills: ["насмотренность", "оперативность", "тон проекта"],
        next: "Контент-продюсер",
      },
      {
        id: "photo-video",
        title: "Фото / видео",
        level: "специализация",
        tasks: "Снимает репетиции, лица, закулисье и материалы для афиш/роликов.",
        skills: ["кадр", "монтаж", "свет"],
        next: "Медиапродюсер",
      },
      {
        id: "design",
        title: "Дизайнер",
        level: "специализация",
        tasks: "Собирает афиши, карточки, визуальные системы и оформление публикаций.",
        skills: ["композиция", "типографика", "айдентика"],
        next: "Арт-директор",
      },
    ],
  },
  {
    id: "management",
    title: "Орг",
    accent: "#FFD166",
    description: "Люди, которые превращают идею в расписание, задачи, дедлайны и готовое событие.",
    roles: [
      {
        id: "helper",
        title: "Помощник",
        level: "вход",
        tasks: "Подхватывает задачи, помогает на точках, закрывает маленькие, но критичные дела.",
        skills: ["надёжность", "скорость", "инициатива"],
        next: "Координатор",
      },
      {
        id: "coordinator",
        title: "Координатор",
        level: "специализация",
        tasks: "Держит людей, смены, списки, дедлайны и связь между командами.",
        skills: ["структура", "дипломатия", "планирование"],
        next: "Продюсер направления",
      },
      {
        id: "producer",
        title: "Продюсер",
        level: "лидер",
        tasks: "Отвечает за результат направления: ресурсы, решения, риски и финальную сборку.",
        skills: ["ответственность", "приоритеты", "переговоры"],
        next: "Главорг",
      },
    ],
  },
];

const roleStats = [
  { value: "4", label: "направления" },
  { value: "12", label: "точек входа" },
  { value: "∞", label: "траекторий роста" },
];

export default function RoleMap() {
  const allRoles = useMemo(
    () => roleTracks.flatMap((track) => track.roles.map((role) => ({ ...role, track }))),
    [],
  );
  const [activeRoleId, setActiveRoleId] = useState("props");
  const activeRole = allRoles.find((role) => role.id === activeRoleId) || allRoles[0];

  return (
    <div className="role-map">
      <section className="role-hero main-width">
        <p className="card-kicker">Навигация по команде</p>
        <h1>РОЛИ</h1>
        <p className="role-hero-lead">
          Карта помогает понять, куда заходить новичку и как расти внутри Megabattle:
          от реквизита, СММ и помощи на точках — до постановки, режиссуры и продюсирования.
        </p>
        <div className="role-stat-row" aria-label="Коротко о карте ролей">
          {roleStats.map((item) => (
            <div className="role-stat" key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="main-width role-map-board" aria-label="Карта ролей Megabattle">
        <div className="role-board-grid">
          <div className="role-map-core">
            <span>старт</span>
            <strong>Я хочу в команду</strong>
            <p>Выбери направление — карта покажет задачи, навыки и следующий шаг.</p>
          </div>

          <div className="role-track-list">
            {roleTracks.map((track) => (
              <article className="role-track" key={track.id} style={{ "--track-accent": track.accent }}>
                <div className="role-track-head">
                  <span>{track.title}</span>
                  <p>{track.description}</p>
                </div>
                <div className="role-card-row">
                  {track.roles.map((role, index) => (
                    <button
                      className={`role-node${activeRoleId === role.id ? " role-node--active" : ""}`}
                      type="button"
                      key={role.id}
                      onClick={() => setActiveRoleId(role.id)}
                    >
                      <small>{role.level}</small>
                      <strong>{role.title}</strong>
                      <span>{index === 0 ? "войти" : index === 1 ? "усилиться" : "вести"}</span>
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <aside className="role-details" style={{ "--track-accent": activeRole.track.accent }}>
            <p className="card-kicker">{activeRole.track.title}</p>
            <h2>{activeRole.title}</h2>
            <p>{activeRole.tasks}</p>
            <div className="role-skill-list">
              {activeRole.skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
            <div className="role-next-step">
              <span>следующий шаг</span>
              <strong>{activeRole.next}</strong>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
