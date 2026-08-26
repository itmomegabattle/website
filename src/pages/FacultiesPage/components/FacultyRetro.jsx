import { Api } from "../../../api";
import "./faculty-retro.css";

// Каждый мегафакультет получает свою «вёрстку номера» газеты.
const RETRO_LAYOUTS = {
  ktu: "systems",
  tint: "signal",
  nozh: "lab",
  ftmf: "spectrum",
  ftmi: "strategy",
};

function fallbackSections(faculty) {
  return [
    {
      title: `${faculty.name}: команда за кадром`,
      text: "Продолжение этой истории всегда пишут люди. За каждым выходом на сцену стоят сборы, ночные обсуждения, распределение ролей и десятки маленьких решений, из которых постепенно складывается общий характер команды.",
      image: "/images/events/event2.jpg",
    },
    {
      title: `${faculty.name}: от первой идеи до финала`,
      text: "Так команда проходит сезон: начинает с почти пустого листа, собирает собственные образы и шутки, а к финалу оставляет моменты, которые вспоминают ещё долго. Здесь позднее можно продолжить рассказ конкретными историями, фотографиями и голосами участников.",
      image: "/images/about-image.png",
    },
  ];
}

export default function FacultyRetro({ faculty, switcher }) {
  const sections = [
    { ...faculty.history },
    ...(faculty.history.sections ?? fallbackSections(faculty)),
  ];
  const layout = RETRO_LAYOUTS[faculty.id] ?? RETRO_LAYOUTS.ktu;

  return (
    <section className="faculty-retro-section">
      <h2 className="faculty-retro-title">РЕТРО</h2>
      {switcher}
      {/* Ключ на самой газете: при переключении анимируется только она,
          заголовок и свитчер остаются на месте. */}
      <div className={`faculty-retro-newspaper faculty-retro-newspaper--${layout}`} key={faculty.id}>
        <header className="faculty-retro-masthead">
          <strong>{faculty.name}</strong>
        </header>
        <div className="faculty-retro-ribbon">
          <span>{faculty.title}</span>
        </div>
        <div className="faculty-retro-facts">
          {sections.map((section) => (
            <article
              className={`faculty-retro-fact${section.image ? "" : " is-text-only"}`}
              key={section.title}
            >
              {section.image ? (
                <div className="faculty-retro-image">
                  <img
                    src={Api.normalizeURL(section.image)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ) : null}
              <div className="faculty-retro-fact__copy">
                <h3>{section.title}</h3>
                <p>{section.text}</p>
              </div>
            </article>
          ))}
        </div>
        <footer className="faculty-retro-footer" aria-hidden="true">
          <span>ITMO Megabattle</span>
          <span>информация еще собирается и будет расширяться</span>
        </footer>
      </div>
    </section>
  );
}
