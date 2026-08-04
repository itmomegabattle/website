export const eventGroups = [
  { id: "megabattle", title: "IMB" },
  { id: "outings", title: "Выезды" },
  { id: "partners", title: "Другое" },
];

const TELEGRAM_DETAIL_PREFIX = "__telegram__:";

export const emptyEvent = {
  slug: "",
  group_key: "megabattle",
  status: "draft",
  name: "",
  type: "",
  description: "",
  event_date_label: "",
  event_time_label: "",
  location: "",
  image_url: "",
  details: [],
  registration_status: "soon",
  registration_label: "Регистрация скоро",
  registration_link: "",
  telegram_label: "Telegram",
  telegram_link: "",
  itmo_events_id: "",
  sort_order: 100,
};

export function splitEventDetails(value) {
  const source = Array.isArray(value) ? value : [];
  const telegramItem = source.find((item) => String(item).startsWith(TELEGRAM_DETAIL_PREFIX));
  const [label = "Telegram", link = ""] = telegramItem
    ? String(telegramItem).slice(TELEGRAM_DETAIL_PREFIX.length).split("|")
    : [];

  return {
    details: source.filter((item) => !String(item).startsWith(TELEGRAM_DETAIL_PREFIX)),
    telegram: link ? { label: label || "Telegram", link } : null,
  };
}

export function mergeEventDetails(details, label, link) {
  const cleanDetails = splitEventDetails(details).details;
  if (!String(link || "").trim()) return cleanDetails;
  return [
    ...cleanDetails,
    `${TELEGRAM_DETAIL_PREFIX}${String(label || "Telegram").trim()}|${String(link).trim()}`,
  ];
}

export function toSlug(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9а-яё]+/gi, "-").replace(/^-+|-+$/g, "");
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}

export function getEventSortTime(event) {
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

export function mapEventToForm(event, groupId) {
  const dbId = event.dbId || event.uuid || (isUuid(event.id) ? event.id : "");
  const parsedDetails = splitEventDetails(event.details);
  const telegram = event.telegram || parsedDetails.telegram;
  return {
    ...emptyEvent,
    ...(dbId ? { id: dbId } : {}),
    slug: event.slug || event.id || "",
    group_key: event.group_key || event.group || groupId,
    status: event.status || "published",
    name: event.name || "",
    type: event.type || "",
    description: event.description || "",
    event_date_label: event.event_date_label || event.date || "",
    event_time_label: event.event_time_label || event.time || "",
    location: event.location || "",
    image_url: event.image_url || event.image || "",
    details: parsedDetails.details,
    registration_status: event.registration_status || event.registration?.status || "soon",
    registration_label: event.registration_label || event.registration?.label || "Регистрация скоро",
    registration_link: event.registration_link || event.registration?.link || "",
    telegram_label: telegram?.label || "Telegram",
    telegram_link: telegram?.link || "",
    itmo_events_id: event.itmo_events_id || "",
    sort_order: event.sort_order || 100,
  };
}
