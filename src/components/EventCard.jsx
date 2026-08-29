import { useEffect, useMemo, useRef, useState } from "react";
import { Api } from "../api";
import "../styles/event-showcase.css";

export default function EventCard({ event }) {
  const hasRegistration = event.registration?.status === "open" && event.registration.link;
  const hasTelegram = Boolean(event.telegram?.link);
  const details = Array.isArray(event.details) ? event.details : [];
  const mediaRef = useRef(null);
  const [mediaHeight, setMediaHeight] = useState(null);
  const brandAvatarTitle = useMemo(() => ({
    "/images/events/megaquest.svg": "МегаКвест",
    "/images/events/megaquiz.svg": "МегаКвиз",
    "/images/events/tour-de-gala.svg": "Тур де Гала",
    "/images/events/gala-concert.svg": "Гала-концерт",
  })[event.image] || "", [event.image]);
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
        {brandAvatarTitle ? (
          <div className="event-brand-avatar" role="img" aria-label={brandAvatarTitle}>
            <svg className="event-brand-avatar__branches" viewBox="0 0 900 900" aria-hidden="true">
              <defs>
                <path id="event-branch-a" d="M-80 130 C130 300 276 88 486 205 S760 190 980 30" />
                <path id="event-branch-b" d="M-70 674 C154 500 282 824 490 604 S732 300 980 438" />
                <path id="event-branch-c" d="M92-70 C218 120 292 270 430 390 S676 700 980 740" />
                <path id="event-branch-d" d="M-90 402 C146 356 302 654 520 554 S760 530 990 692" />
                <path id="event-branch-e" d="M-24 970 C186 616 340 842 550 790 S786 660 976 610" />
              </defs>
              <g className="event-brand-avatar__branch-shadow">
                <use href="#event-branch-a" /><use href="#event-branch-b" />
                <use href="#event-branch-c" /><use href="#event-branch-d" />
                <use href="#event-branch-e" />
              </g>
              <g className="event-brand-avatar__branch-core">
                <use href="#event-branch-a" /><use href="#event-branch-b" />
                <use href="#event-branch-c" /><use href="#event-branch-d" />
                <use href="#event-branch-e" />
              </g>
            </svg>
            <span>{brandAvatarTitle}</span>
          </div>
        ) : (
          <img
            src={Api.normalizeURL(event.image)}
            alt={event.name}
            width="900"
            height="900"
            loading="lazy"
            decoding="async"
          />
        )}
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
