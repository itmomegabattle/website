import { Api } from "../api";
import { supabase } from "../lib/supabase";

function mapDbEvent(event) {
  return {
    id: event.slug,
    group: event.group_key,
    name: event.name,
    type: event.type,
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
  if (!supabase) {
    return Api.getStaticEvents();
  }

  const { data, error } = await supabase
    .from("project_events")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return Api.getStaticEvents();
  }

  if (!data?.length) {
    return Api.getStaticEvents();
  }

  return data.map(mapDbEvent);
}
