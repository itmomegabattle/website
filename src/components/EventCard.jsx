import { Api } from "../api";
import "../styles/event-showcase.css";

export default function EventCard({ event }) {
  const hasRegistration = event.registration?.status === "open" && event.registration.link;
  const details = Array.isArray(event.details) ? event.details : [];
  const eventDetails = (
    <>
      <p className="event-showcase-description">{event.description}</p>

      <dl className="event-meta-grid">
        <div>
          <dt>Когда</dt>
          <dd>{event.date}</dd>
        </div>
        <div>
          <dt>Время</dt>
          <dd>{event.time}</dd>
        </div>
        <div>
          <dt>Где</dt>
          <dd>{event.location}</dd>
        </div>
      </dl>

      {details.length > 0 && (
        <div className="pill-row">
          {details.map((detail) => (
            <span className="pill" key={detail}>
              {detail}
            </span>
          ))}
        </div>
      )}
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
      </div>
    </article>
  );
}
