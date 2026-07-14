import { useMemo, useState } from "react";
import "../styles/role-map.css";

const roleTracks = [
  {
    id: "stage",
    title: "Сцена",
    accent: "#0066FF",
    description: "Всё, что зритель видит в номере: идея, движение, актёры и финальная постановка.",
    roles: [
      {
        id: "actor",
        title: "Актёр",
        level: "вход",
        tasks: "Выходит на сцену, держит образ, работает с партнёрами и ритмом номера.",
        skills: ["сценическая смелость", "пластика", "командность"],
        next: "Старший актёр",
      },
      {
        id: "lead-actor",
        title: "Старший актёр",
        level: "опора",
        tasks: "Помогает новичкам держать рисунок, знает переходы и страхует сцену на репетициях.",
        skills: ["ответственность", "партнёрство", "стабильность"],
        next: "Постановщик",
      },
      {
        id: "choreo",
        title: "Постановщик",
        level: "специализация",
        tasks: "Собирает движения, рисунок сцены, переходы и репетиционную механику.",
        skills: ["ритм", "композиция", "репетиции"],
        next: "Хореограф",
      },
      {
        id: "choreographer",
        title: "Хореограф",
        level: "мастер",
        tasks: "Отвечает за пластику, чистоту движений, синхрон и физическую выразительность.",
        skills: ["пластика", "детализация", "темп"],
        next: "Режиссёр",
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
    accent: "#0047B8",
    description: "Материальный мир выступления: реквизит, костюмы, сцена, свет, звук и безопасность.",
    roles: [
      {
        id: "props",
        title: "Реквизитер",
        level: "вход",
        tasks: "Ищет, делает, подписывает, хранит и вовремя выносит реквизит.",
        skills: ["аккуратность", "смекалка", "тайминг"],
        next: "Декоратор",
      },
      {
        id: "decorator",
        title: "Декоратор",
        level: "сборка",
        tasks: "Собирает визуальную среду номера: объекты, фактуры, сценические элементы.",
        skills: ["пространство", "руки", "материалы"],
        next: "Костюмер",
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
        id: "look-artist",
        title: "Художник по образам",
        level: "мастер",
        tasks: "Держит цельный визуал персонажей: костюм, грим, силуэт и считываемость.",
        skills: ["образ", "цвет", "целостность"],
        next: "Техкоординатор",
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
    accent: "#00A8FF",
    description: "То, как проект звучит и выглядит вне сцены: соцсети, фото, видео, дизайн, тексты.",
    roles: [
      {
        id: "smm",
        title: "СММ",
        level: "вход",
        tasks: "Ведёт соцсети, ловит инфоповоды, превращает хаос репетиций в живой контент.",
        skills: ["насмотренность", "оперативность", "тон проекта"],
        next: "Копирайтер",
      },
      {
        id: "copywriter",
        title: "Копирайтер",
        level: "текст",
        tasks: "Пишет посты, описания, сценарии коротких роликов и формулировки для сайта.",
        skills: ["тон", "структура", "редактура"],
        next: "Фото / видео",
      },
      {
        id: "photo-video",
        title: "Фото / видео",
        level: "специализация",
        tasks: "Снимает репетиции, лица, закулисье и материалы для афиш/роликов.",
        skills: ["кадр", "монтаж", "свет"],
        next: "Монтажёр",
      },
      {
        id: "editor",
        title: "Монтажёр",
        level: "пост",
        tasks: "Собирает ролики, тизеры, отчёты, клипы и быстрые вертикальные видео.",
        skills: ["ритм", "звук", "динамика"],
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
    accent: "#FFFFFF",
    description: "Люди, которые превращают идею в расписание, задачи, дедлайны и готовое событие.",
    roles: [
      {
        id: "helper",
        title: "Помощник",
        level: "вход",
        tasks: "Подхватывает задачи, помогает на точках, закрывает маленькие, но критичные дела.",
        skills: ["надёжность", "скорость", "инициатива"],
        next: "Куратор точки",
      },
      {
        id: "point-curator",
        title: "Куратор точки",
        level: "точка",
        tasks: "Держит конкретную зону: люди, материалы, чек-листы, тайминг и готовность.",
        skills: ["контроль", "ясность", "связь"],
        next: "Координатор",
      },
      {
        id: "coordinator",
        title: "Координатор",
        level: "специализация",
        tasks: "Держит людей, смены, списки, дедлайны и связь между командами.",
        skills: ["структура", "дипломатия", "планирование"],
        next: "Ответственный",
      },
      {
        id: "responsible",
        title: "Ответственный",
        level: "направление",
        tasks: "Берёт направление целиком: распределяет задачи, собирает статусы, решает блокеры.",
        skills: ["решения", "команда", "приоритеты"],
        next: "Продюсер",
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
  {
    id: "music",
    title: "Звук",
    accent: "#4B6BFB",
    description: "Музыка, микрофоны, склейки, эффекты и всё, что делает номер слышимым.",
    roles: [
      {
        id: "music-helper",
        title: "Ассистент звука",
        level: "вход",
        tasks: "Помогает искать треки, держит версии файлов и проверяет, что всё открывается.",
        skills: ["слух", "порядок", "файлы"],
        next: "Звукорежиссёр",
      },
      {
        id: "sound-editor",
        title: "Звукорежиссёр",
        level: "сборка",
        tasks: "Собирает музыку, склейки, эффекты, отбивки и чистые версии фонограмм.",
        skills: ["монтаж", "ритм", "баланс"],
        next: "Музыкальный редактор",
      },
      {
        id: "music-editor",
        title: "Музыкальный редактор",
        level: "специализация",
        tasks: "Подбирает музыкальную драматургию номера и помогает режиссёру держать темп.",
        skills: ["драматургия", "насмотренность", "ритм"],
        next: "Саунд-дизайнер",
      },
      {
        id: "sound-designer",
        title: "Саунд-дизайнер",
        level: "мастер",
        tasks: "Создаёт атмосферу через эффекты, переходы, шумы и звуковые акценты.",
        skills: ["атмосфера", "детали", "эффекты"],
        next: "Техпродюсер",
      },
      {
        id: "audio-lead",
        title: "Аудио-лид",
        level: "лидер",
        tasks: "Отвечает за весь звук направления: файлы, площадку, прогоны и финальную сдачу.",
        skills: ["ответственность", "коммуникация", "система"],
        next: "Технический продюсер",
      },
    ],
  },
  {
    id: "pr",
    title: "Пиар",
    accent: "#008CFF",
    description: "Партнёрки, внешние контакты, анонсы, аудитории и публичное присутствие проекта.",
    roles: [
      {
        id: "pr-helper",
        title: "PR-ассистент",
        level: "вход",
        tasks: "Собирает контакты, таблицы, дедлайны публикаций и помогает с рассылками.",
        skills: ["таблицы", "внимание", "поиск"],
        next: "Комьюнити",
      },
      {
        id: "community",
        title: "Комьюнити",
        level: "люди",
        tasks: "Держит связь с участниками, отвечает на вопросы и помогает не потеряться.",
        skills: ["эмпатия", "скорость", "тон"],
        next: "Партнёрщик",
      },
      {
        id: "partner-manager",
        title: "Партнёрщик",
        level: "специализация",
        tasks: "Общается с партнёрами, согласует форматы, выгоды, сроки и материалы.",
        skills: ["переговоры", "письма", "ценность"],
        next: "PR-менеджер",
      },
      {
        id: "pr-manager",
        title: "PR-менеджер",
        level: "мастер",
        tasks: "Планирует внешний пиар: анонсы, коллаборации, инфоповоды и медиапакеты.",
        skills: ["стратегия", "публичность", "упаковка"],
        next: "PR-лид",
      },
      {
        id: "pr-lead",
        title: "PR-лид",
        level: "лидер",
        tasks: "Отвечает за узнаваемость проекта и качество всех внешних касаний.",
        skills: ["видение", "связи", "репутация"],
        next: "Продюсер внешних коммуникаций",
      },
    ],
  },
  {
    id: "digital",
    title: "Диджитал",
    accent: "#00D1FF",
    description: "Сайт, боты, NFC, формы, данные и техническая оболочка вокруг проекта.",
    roles: [
      {
        id: "data-helper",
        title: "Помощник по данным",
        level: "вход",
        tasks: "Собирает таблицы, проверяет списки, чистит данные и помогает с импортами.",
        skills: ["таблицы", "внимание", "логика"],
        next: "Админ сайта",
      },
      {
        id: "site-admin",
        title: "Админ сайта",
        level: "контент",
        tasks: "Обновляет контент, мероприятия, партнёров, истории и следит за корректностью.",
        skills: ["CMS", "тексты", "аккуратность"],
        next: "Разработчик",
      },
      {
        id: "developer",
        title: "Разработчик",
        level: "специализация",
        tasks: "Пишет сайт, API, интеграции, ботов и чинит то, что сломалось в самый момент.",
        skills: ["код", "архитектура", "дебаг"],
        next: "Интегратор",
      },
      {
        id: "integrator",
        title: "Интегратор",
        level: "мастер",
        tasks: "Связывает сайт, боты, ITMO.ID, NFC, базу и внешние сервисы в одну систему.",
        skills: ["API", "безопасность", "системность"],
        next: "Техлид",
      },
      {
        id: "techlead",
        title: "Техлид",
        level: "лидер",
        tasks: "Отвечает за технические решения, стабильность, безопасность и развитие платформы.",
        skills: ["решения", "надёжность", "команда"],
        next: "CTO проекта",
      },
    ],
  },
];

const roleStats = [
  { value: String(roleTracks.length), label: "направлений" },
  { value: String(roleTracks.reduce((sum, track) => sum + track.roles.length, 0)), label: "ролей" },
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
          от реквизита, СММ и помощи на точках — до режиссуры, продюсирования,
          разработки и внешних коммуникаций.
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

      <section className="role-map-board role-map-wide" aria-label="Карта ролей Megabattle">
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
