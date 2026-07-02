import { useQuery } from "@tanstack/react-query";
import { Api } from "../api";

const eventGroups = [
  {
    id: "megabattle",
    title: "МЕРОПРИЯТИЯ ITMO MEGABATTLE",
  },
  {
    id: "partners",
    title: "МЕРОПРИЯТИЯ ПАРТНЁРОВ",
  },
];

function EventCard({ event }) {
  const hasRegistration = event.registration?.status === "open" && event.registration.link;

  return (
    <article className="event-showcase-card">
      <div className="event-showcase-media">
        <img src={Api.normalizeURL(event.image)} alt={event.name} />
      </div>

      <div className="event-showcase-info">
        <p className="card-kicker">{event.type}</p>
        <h2>{event.name}</h2>
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

        <div className="pill-row">
          {event.details.map((detail) => (
            <span className="pill" key={detail}>
              {detail}
            </span>
          ))}
        </div>

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

export default function EventSections() {
  const events = useQuery({
    queryKey: ["events"],
    queryFn: Api.getEvents,
    initialData: [],
  }).data;

  return eventGroups.map((group) => {
    const groupEvents = events.filter((event) => event.group === group.id);

    return (
      <section className="main-width events-section" id={`events-${group.id}`} key={group.id}>
        <h1>{group.title}</h1>
        <div className="event-showcase-list">
          {groupEvents.map((event) => (
            <EventCard event={event} key={event.id} />
          ))}
        </div>
      </section>
    );
  });
}
