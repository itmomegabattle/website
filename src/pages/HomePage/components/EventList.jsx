import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Api } from "../../../api";
import "./event-list.css";
import EventCard from "./EventCard";

function getEventSortTime(event) {
  const rawDate = event.event_date_label || event.date || "";
  const isoMatch = String(rawDate).match(/(\d{4})[-.](\d{1,2})[-.](\d{1,2})/);
  const ruMatch = String(rawDate).match(/(\d{1,2})[.\-/](\d{1,2})(?:[.\-/](\d{2,4}))?/);
  if (isoMatch) return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3])).getTime();
  if (ruMatch) {
    const year = ruMatch[3] ? Number(String(ruMatch[3]).padStart(4, "20")) : 2026;
    return new Date(year, Number(ruMatch[2]) - 1, Number(ruMatch[1])).getTime();
  }
  return Number.MAX_SAFE_INTEGER - Number(event.sort_order || 0);
}

const DAY = 24 * 60 * 60 * 1000;

export default function EventList() {
  // получить данные с API (или из кэша)
  const events = useQuery({
    queryKey: ["events"],
    queryFn: Api.getEvents,
    placeholderData: [],
  }).data;

  const visibleEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = events
      .map((event) => ({ event, timestamp: getEventSortTime(event) }))
      .filter(({ timestamp }) => Number.isFinite(timestamp) && timestamp < Number.MAX_SAFE_INTEGER && timestamp >= today.getTime())
      .sort((a, b) => a.timestamp - b.timestamp);
    const soon = upcoming.filter(({ timestamp }) => timestamp <= today.getTime() + 14 * DAY);
    return (soon.length ? soon : upcoming.slice(0, 1)).map(({ event }) => event);
  }, [events]);

  return (
    <div className="event-cards">
      {visibleEvents.map((event) => (
        <EventCard event={event} key={event.id ?? `${event.name}-${event.date}`} />
      ))}

      {visibleEvents.length === 0 && (
        <div className="null-event">Пока нет ближайших событий :(</div>
      )}
    </div>
  );
}
