import { useEffect, useMemo, useRef, useState } from "react";
import { Api } from "../api";
import "../styles/event-showcase.css";

export default function EventCard({ event }) {
  const hasRegistration = event.registration?.status === "open" && event.registration.link;
  const hasTelegram = Boolean(event.telegram?.link);
  const details = Array.isArray(event.details) ? event.details : [];
  const mediaRef = useRef(null);
  const [mediaHeight, setMediaHeight] = useState(null);
  const titleSizeClass = useMemo(() => {
    const compactName = String(event.name || "").replace(/\s+/g, "");
    return compactName.length > 20 ? " event-showcase-title--long" : "";
  }, [event.name]);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return undefined;

    const syncHeight = () => setMediaHeight(Math.round(media.getBoundingClientRect().height));
    syncHeight();

    const observer = new ResizeObserver(syncHeight);
    observer.observe(media);
    window.addEventListener("resize", syncHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncHeight);
    };
  }, []);

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
    <article
      className="event-showcase-card"
      style={mediaHeight ? { "--event-media-height": `${mediaHeight}px` } : undefined}
    >
      <div className="event-showcase-media" ref={mediaRef}>
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
            <h2 className={`event-showcase-title${titleSizeClass}`}>{event.name}</h2>
          </div>
        </div>
        <div className="event-showcase-desktop-details">{eventDetails}</div>
        <details className="event-mobile-details">
          <summary>Подробнее</summary>
          {eventDetails}
        </details>

        <div className="event-action-row">
          {hasRegistration ? (
            <a
              className="event-registration-button"
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
              className="event-registration-button event-registration-button--secondary"
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
