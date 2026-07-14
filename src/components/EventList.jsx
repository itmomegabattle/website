import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Api } from "../api";
import "../styles/event-list.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { faCalendar } from "@fortawesome/free-regular-svg-icons";
import ExternalLink from "./ExternalLink";

const monthNamesForm2 = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

export default function EventList() {
  // получить данные с API (или из кэша)
  const events = useQuery({
    queryKey: ["events"],
    queryFn: Api.getEvents,
    initialData: [],
  }).data;

  // На главной выводим первое мероприятие из общей секции мероприятий.
  const visibleEvents = useMemo(() => {
    const firstEvent = [...events].sort((a, b) => new Date(a.date) - new Date(b.date))[0];
    return firstEvent ? [firstEvent] : [];
  }, [events]);

  return (
    <div className="event-cards">
      {visibleEvents.map((event) => {
        const dateObj = new Date(event.date);
        const dateDay = dateObj.getDate().toString();
        const dateMonth = monthNamesForm2[dateObj.getMonth()];
        const hours = dateObj.getHours();
        const minutes = dateObj.getMinutes();
        const hasEventTime = hours !== 0 || minutes !== 0;
        const eventTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

        return (
          <div
            className="event-card"
            key={event.key ?? `${event.name}-${event.date}`}
          >
            {/* Картинка события */}
            <div className="event-image">
              <img src={Api.normalizeURL(event.image)} alt={event.name} />
            </div>

            <div className="event-info">
              <h3>{event.name}</h3>

              {/* Дата и место */}
              <p>
                <span className="event-date">
                  <FontAwesomeIcon icon={faCalendar} aria-hidden="true" />
                  <span>
                    {dateDay} {dateMonth}
                    {hasEventTime ? `, ${eventTime}` : ""}
                  </span>
                </span>
                <br />
                <span className="event-location">
                  <FontAwesomeIcon icon={faLocationDot} aria-hidden="true" />
                  <span>{event.address}</span>
                </span>
              </p>

              {/* Описание */}
              <p className="event-description">{event.description}</p>

              {/* Дополнительные ссылки */}
              {event.links?.length > 0 && (
                <div className="event-links">
                  {event.links.map((item, i) => (
                    <ExternalLink key={i} href={item.link} text={item.text} />
                  ))}
                </div>
              )}

              {/* Ссылка на регистрацию */}
              {event.registrationLink && (
                <button
                  className="button special event-button"
                  type="button"
                  onClick={() => window.open(event.registrationLink, "_blank")}
                >
                  Регистрация
                </button>
              )}
            </div>
          </div>
        );
      })}

      {visibleEvents.length === 0 && (
        <div className="null-event">Пока нет ближайших событий :(</div>
      )}
    </div>
  );
}
