import { Api } from "../api";
import { backendApi } from "../lib/backendApi";

function mapDbEvent(event) {
  return {
    id: event.slug,
    dbId: event.id,
    slug: event.slug,
    status: event.status,
    group_key: event.group_key,
    group: event.group_key,
    name: event.name,
    type: event.type,
    event_date_label: event.event_date_label,
    event_time_label: event.event_time_label,
    image_url: event.image_url,
    registration_status: event.registration_status,
    registration_label: event.registration_label,
    registration_link: event.registration_link,
    itmo_events_id: event.itmo_events_id,
    sort_order: event.sort_order,
    date: event.event_date_label || "дата уточняется",
    time: event.event_time_label || "время уточняется",
    location: event.location || "место уточняется",
    description: event.description || "",
    registration: {
      status: event.registration_status || "soon",
      label: event.registration_label || "Регистрация скоро",
      link: event.registration_link || "",
    },
    details: Array.isArray(event.details) ? event.details : [],
    image: event.image_url || "/images/events/event1.jpg",
  };
}

export async function getPublishedEvents() {
  try {
    const result = await backendApi("/api/v1/content/events?limit=200");
    return (result.items ?? []).map(mapDbEvent);
  } catch { return Api.getStaticEvents(); }
}
