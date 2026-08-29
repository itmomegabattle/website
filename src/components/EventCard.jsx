import { useEffect, useMemo, useRef, useState } from "react";
import { Api } from "../api";
import "../styles/event-showcase.css";

const BRAND_AVATARS = {
  "/images/events/megaquest.svg": {
    title: "МегаКвест",
    paths: [
      "M-80 130 C130 300 276 88 486 205 S760 190 980 30",
      "M-70 674 C154 500 282 824 490 604 S732 300 980 438",
      "M92-70 C218 120 292 270 430 390 S676 700 980 740",
      "M-90 402 C146 356 302 654 520 554 S760 530 990 692",
      "M-24 970 C186 616 340 842 550 790 S786 660 976 610",
    ],
  },
  "/images/events/megaquiz.svg": {
    title: "МегаКвиз",
    paths: [
      "M-60 238 C174 72 298 342 492 206 S754 20 968 142",
      "M-84 548 C130 704 282 426 470 558 S718 824 986 706",
      "M242-70 C348 116 270 246 410 374 S738 434 974 318",
      "M-50 826 C176 790 280 594 474 650 S714 856 956 930",
      "M650-50 C552 158 674 256 578 418 S300 666 174 970",
    ],
  },
  "/images/events/tour-de-gala.svg": {
    title: "Тур де Гала",
    paths: [
      "M-76 84 C164 164 240 402 460 330 S714 100 982 178",
      "M-70 756 C144 568 294 706 456 568 S694 202 982 342",
      "M48-60 C170 182 152 366 322 484 S694 584 962 824",
      "M-82 470 C166 354 294 530 486 454 S742 438 990 596",
      "M248 970 C330 760 490 760 568 602 S606 208 796-40",
    ],
  },
  "/images/events/gala-concert.svg": {
    title: "Гала-концерт",
    paths: [
      "M-80 300 C146 422 276 176 454 306 S712 638 980 520",
      "M-70 884 C142 618 302 846 470 674 S724 298 986 216",
      "M116-60 C240 122 366 152 438 338 S444 730 624 964",
      "M-90 566 C126 474 266 630 442 552 S718 356 986 450",
      "M508-70 C620 160 558 300 688 414 S864 616 980 780",
    ],
  },
};

export default function EventCard({ event }) {
  const hasRegistration = event.registration?.status === "open" && event.registration.link;
  const hasTelegram = Boolean(event.telegram?.link);
  const details = Array.isArray(event.details) ? event.details : [];
  const mediaRef = useRef(null);
  const [mediaHeight, setMediaHeight] = useState(null);
  const brandAvatar = BRAND_AVATARS[event.image];
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
        {brandAvatar ? (
          <div className="event-brand-avatar" role="img" aria-label={brandAvatar.title}>
            <svg className="event-brand-avatar__branches" viewBox="0 0 900 900" aria-hidden="true">
              <g className="event-brand-avatar__branch-shadow">
                {brandAvatar.paths.map((path) => <path d={path} key={`shadow-${path}`} />)}
              </g>
              <g className="event-brand-avatar__branch-core">
                {brandAvatar.paths.map((path) => <path d={path} key={`core-${path}`} />)}
              </g>
            </svg>
            <span>{brandAvatar.title}</span>
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
