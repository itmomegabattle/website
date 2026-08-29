import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Api } from "../api";
import EventCard from "./EventCard";
import { eventGroups, getEventSortTime } from "./events/eventConfig";
import "../styles/member-list.css";

export default function EventSections() {
  const [activeGroupId, setActiveGroupId] = useState("megabattle");
  const events = useQuery({ queryKey: ["events"], queryFn: Api.getEvents, placeholderData: [] }).data;

  const activeGroup = eventGroups.find((group) => group.id === activeGroupId) || eventGroups[0];
  const isHiddenGame = (event) => /^(game|megagame|мегагейм)$/i.test(String(event.slug || event.id || event.name || "").trim());
  const groupEvents = events
    .filter((event) => event.group === activeGroup.id && !isHiddenGame(event))
    .sort((a, b) => getEventSortTime(a) - getEventSortTime(b));

  return (
    <section className="main-width events-section events-hub" id="events">
      <h1>МЕРОПРИЯТИЯ</h1>
      <div className="team-filters event-team-filters">
        <div
          className="team-toggle event-group-tabs"
          data-filter={activeGroup.id}
          role="tablist"
          aria-label="Тип мероприятий"
        >
          <span className="toggle-slider event-group-slider" aria-hidden="true" />
          {eventGroups.map((group) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeGroup.id === group.id}
              className={`toggle-btn${activeGroup.id === group.id ? " active is-active" : ""}`}
              key={group.id}
              onClick={() => {
                setActiveGroupId(group.id);
              }}
            >
              {group.title}
            </button>
          ))}
        </div>
      </div>

      <div className="event-showcase-list" role="tabpanel">
        {groupEvents.map((event) => <EventCard event={event} key={event.id} />)}
        {groupEvents.length === 0 && <p className="event-group-empty">События этой категории скоро появятся.</p>}
      </div>
    </section>
  );
}
