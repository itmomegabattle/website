import { Api } from "../../api";
import Card from "./Card";
import Tag, { TagRow } from "./Tag";
import "../../styles/button.css";
import "./event-card.css";

export default function EventCard({ event }) {
  const hasRegistration = event.registration?.status === "open" && event.registration.link;
  const hasTelegram = Boolean(event.telegram?.link);
  const hasImage = Boolean(event.image);
  const details = Array.isArray(event.details) ? event.details : [];

  return (
    <Card as="article" className={`event-card${hasImage ? "" : " event-card--no-media"}`}>
      {hasImage && (
        <img
          className="event-card__image"
          src={Api.normalizeURL(event.image)}
          alt={event.name}
          width="900"
          height="900"
          loading="lazy"
          decoding="async"
        />
      )}

      <div className="event-card__body">
        <p className="event-card__kicker">{event.type}</p>
        <h2 className="card-title">{event.name}</h2>
        <p className="event-card__description">{event.description}</p>

        <TagRow>
          <Tag aria-label="Дата">{event.date}</Tag>
          <Tag aria-label="Время">{event.time}</Tag>
          <Tag aria-label="Место">{event.location}</Tag>
          {details.map((detail) => (
            <Tag key={detail}>{detail}</Tag>
          ))}
        </TagRow>

        <div className="event-card__actions">
          {hasRegistration ? (
            <a className="button" href={event.registration.link} target="_blank" rel="noreferrer">
              {event.registration.label}
            </a>
          ) : (
            <span className="button" aria-disabled="true">
              {event.registration?.label ?? "Регистрация появится позже"}
            </span>
          )}
          {hasTelegram && (
            <a className="button" href={event.telegram.link} target="_blank" rel="noreferrer">
              {event.telegram.label || "Telegram"}
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
