import { Api } from "../api";
import "../styles/event-showcase.css";

export default function EventCard({ event }) {
  const hasRegistration = event.registration?.status === "open" && event.registration.link;
  const hasTelegram = Boolean(event.telegram?.link);
  const details = Array.isArray(event.details) ? event.details : [];
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
        <p className="card-kicker">{event.type}</p>
        <h2>{event.name}</h2>
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
