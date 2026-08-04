import { Api } from "../api";
import "../styles/event-showcase.css";

const OUTING_FACULTIES = [
  { aliases: ["фтмф"], label: "ФТМФ", icons: ["/images/faculties/ftmf.svg"] },
  {
    aliases: ["фтми"],
    label: "ФТМИ",
    icons: [
      "/images/faculties/ftmi-f.svg",
      "/images/faculties/ftmi-t.svg",
      "/images/faculties/ftmi-m.svg",
      "/images/faculties/ftmi-i.svg",
    ],
  },
  { aliases: ["нож"], label: "НоЖ", icons: ["/images/faculties/nozh.svg"] },
  { aliases: ["тинт"], label: "ТИнТ", icons: ["/images/faculties/tint.svg"] },
  { aliases: ["ктиу", "кту"], label: "КТУ", icons: ["/images/faculties/ktu.svg"] },
];

function getOutingFaculty(event) {
  if (event.group !== "outings") return null;

  const haystack = `${event.name || ""} ${event.type || ""}`.toLocaleLowerCase("ru");
  return OUTING_FACULTIES.find(({ aliases }) =>
    aliases.some((alias) => haystack.includes(alias)),
  );
}

export default function EventCard({ event }) {
  const hasRegistration = event.registration?.status === "open" && event.registration.link;
  const hasTelegram = Boolean(event.telegram?.link);
  const details = Array.isArray(event.details) ? event.details : [];
  const outingFaculty = getOutingFaculty(event);
  const eventDetails = (
    <>
      <p className="event-showcase-description">{event.description}</p>
      <div className="event-showcase-actions-zone">
        <div className="event-meta-grid">
          <span aria-label="Дата">{event.date}</span>
          <span aria-label="Время">{event.time}</span>
          <span aria-label="Место">{event.location}</span>
        </div>

        {details.length > 0 && (
          <div className="pill-row">
            {details.map((detail) => (
              <span className="pill" key={detail}>
                {detail}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );

  return (
    <article className="event-showcase-card">
      <div className="event-showcase-media">
        <img
          src={Api.normalizeURL(event.image)}
          alt={event.name}
          width="900"
          height="900"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="event-showcase-info">
        <div className="event-showcase-heading">
          <div className="event-showcase-heading-copy">
            <p className="card-kicker">{event.type}</p>
            <h2>{event.name}</h2>
          </div>
          {outingFaculty && (
            <div
              className={`event-faculty-avatar${outingFaculty.icons.length > 1 ? " is-composite" : ""}`}
              aria-label={`Мегафакультет ${outingFaculty.label}`}
            >
              {outingFaculty.icons.map((src) => (
                <img src={src} alt="" aria-hidden="true" key={src} />
              ))}
            </div>
          )}
        </div>
        <div className="event-showcase-desktop-details">{eventDetails}</div>
        <details className="event-mobile-details">
          <summary>Подробнее</summary>
          {eventDetails}
        </details>

        <div className="event-action-row">
          {hasRegistration ? (
            <a
              className="text-button event-registration-button"
              href={event.registration.link}
              target="_blank"
              rel="noreferrer"
            >
              {event.registration.label}
            </a>
          ) : (
            <span className="event-registration-button event-registration-button--disabled">
              {event.registration?.label ?? "Регистрация появится позже"}
            </span>
          )}
          {hasTelegram && (
            <a
              className="text-button event-registration-button event-registration-button--secondary"
              href={event.telegram.link}
              target="_blank"
              rel="noreferrer"
            >
              {event.telegram.label || "Telegram"}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
