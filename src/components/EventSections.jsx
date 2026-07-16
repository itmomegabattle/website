import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Api } from "../api";
import { useAuth } from "../context/AuthContext";
import EventCard from "./EventCard";
import {
  deleteAdminEvent,
  getAdminEvents,
  isAdminProfile,
  uploadAdminEventImage,
  upsertAdminEvent,
} from "../services/adminService";

const eventGroups = [
  {
    id: "megabattle",
    title: "MEGABATTLE",
  },
  {
    id: "partners",
    title: "ПАРТНЁРЫ",
  },
];

const emptyEvent = {
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
  itmo_events_id: "",
  sort_order: 100,
};

function toSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}

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

function mapEventToForm(event, groupId) {
  const dbId = event.dbId || event.uuid || (isUuid(event.id) ? event.id : "");
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
    details: event.details || [],
    registration_status: event.registration_status || event.registration?.status || "soon",
    registration_label: event.registration_label || event.registration?.label || "Регистрация скоро",
    registration_link: event.registration_link || event.registration?.link || "",
    itmo_events_id: event.itmo_events_id || "",
    sort_order: event.sort_order || 100,
  };
}

function InlineEventEditor({ groupId, selectedEvent, onClose }) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(() => selectedEvent ? mapEventToForm(selectedEvent, groupId) : { ...emptyEvent, group_key: groupId });
  const [detailsText, setDetailsText] = useState(() => (selectedEvent?.details || []).join("\n"));
  const [status, setStatus] = useState("");

  const saveMutation = useMutation({
    mutationFn: (payload) => upsertAdminEvent(payload, profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["admin-events-inline"] });
      setStatus("Событие сохранено");
      onClose?.();
    },
  });

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === "sort_order" ? Number(value) : value,
      slug: name === "name" && !current.slug ? toSlug(value) : current.slug,
    }));
  };

  const handleImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus("Загружаем фото…");
    const imageUrl = await uploadAdminEventImage(file);
    setForm((current) => ({ ...current, image_url: imageUrl }));
    setStatus("Фото загружено");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    saveMutation.mutate({
      ...form,
      slug: form.slug || toSlug(form.name),
      group_key: groupId,
      details: detailsText.split("\n").map((item) => item.trim()).filter(Boolean),
    });
  };

  return (
    <form className="event-inline-editor" onSubmit={handleSubmit}>
      <div className="event-inline-editor-head">
        <div>
          <p className="card-kicker">Inline admin</p>
          <h2>{selectedEvent ? "Редактировать мероприятие" : "Новое мероприятие"}</h2>
        </div>
        <button type="button" onClick={onClose}>Закрыть</button>
      </div>

      <div className="event-inline-editor-grid">
        <label className="form-field"><span>Название</span><input name="name" value={form.name} onChange={updateField} required /></label>
        <label className="form-field"><span>Статус</span><select name="status" value={form.status} onChange={updateField}><option value="draft">Черновик</option><option value="published">Опубликовано</option><option value="archived">Архив</option></select></label>
        <label className="form-field"><span>Тип</span><input name="type" value={form.type || ""} onChange={updateField} /></label>
        <label className="form-field"><span>Дата</span><input name="event_date_label" value={form.event_date_label || ""} onChange={updateField} /></label>
        <label className="form-field"><span>Время</span><input name="event_time_label" value={form.event_time_label || ""} onChange={updateField} /></label>
        <label className="form-field"><span>Место</span><input name="location" value={form.location || ""} onChange={updateField} /></label>
      </div>

      <label className="form-field"><span>Описание</span><textarea name="description" rows="4" value={form.description || ""} onChange={updateField} /></label>
      <label className="form-field"><span>Детали, каждая с новой строки</span><textarea rows="3" value={detailsText} onChange={(event) => setDetailsText(event.target.value)} /></label>

      <div className="event-inline-editor-grid">
        <label className="form-field"><span>Фото</span><input type="file" accept="image/*" onChange={handleImage} /></label>
        <label className="form-field"><span>Регистрация</span><select name="registration_status" value={form.registration_status} onChange={updateField}><option value="open">Открыта</option><option value="soon">Скоро</option><option value="closed">Закрыта</option></select></label>
        <label className="form-field"><span>Текст кнопки</span><input name="registration_label" value={form.registration_label || ""} onChange={updateField} /></label>
        <label className="form-field"><span>Ссылка регистрации</span><input name="registration_link" value={form.registration_link || ""} onChange={updateField} /></label>
        <label className="form-field"><span>ID ITMO Events</span><input name="itmo_events_id" value={form.itmo_events_id || ""} onChange={updateField} /></label>
      </div>

      {saveMutation.error && <p className="form-error">{saveMutation.error.message}</p>}
      {status && <p className="form-status">{status}</p>}
      <button className="text-button auth-submit" type="submit" disabled={saveMutation.isPending}>
        {saveMutation.isPending ? "Сохраняем…" : "Сохранить"}
      </button>
    </form>
  );
}

export default function EventSections() {
  const { profile } = useAuth();
  const canEdit = isAdminProfile(profile);
  const queryClient = useQueryClient();
  const [editor, setEditor] = useState(null);
  const events = useQuery({
    queryKey: ["events"],
    queryFn: Api.getEvents,
    initialData: [],
  }).data;
  const { data: adminEvents = [] } = useQuery({
    queryKey: ["admin-events-inline"],
    queryFn: getAdminEvents,
    enabled: canEdit,
  });
  const deleteMutation = useMutation({
    mutationFn: (eventId) => deleteAdminEvent(eventId, profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["admin-events-inline"] });
    },
  });

  return eventGroups.map((group) => {
    const groupEvents = events
      .filter((event) => event.group === group.id)
      .sort((first, second) => getEventSortTime(first) - getEventSortTime(second));
    const groupAdminEvents = adminEvents.filter((event) => event.group_key === group.id);

    return (
      <section className="main-width events-section" id={`events-${group.id}`} key={group.id}>
        <h1>{group.title}</h1>
        {canEdit && (
          <div className="event-admin-strip">
            <button type="button" onClick={() => setEditor({ groupId: group.id, event: null })}>
              Добавить мероприятие
            </button>
            {deleteMutation.error && <span className="event-admin-error">{deleteMutation.error.message}</span>}
            {groupAdminEvents.map((event) => (
              <span className="event-admin-chip" key={event.id}>
                {event.name} · {event.status}
                <button type="button" onClick={() => setEditor({ groupId: group.id, event })}>изменить</button>
                <button type="button" onClick={() => deleteMutation.mutate(event.id)}>удалить</button>
              </span>
            ))}
          </div>
        )}
        {editor?.groupId === group.id && (
          <InlineEventEditor
            groupId={group.id}
            selectedEvent={editor.event}
            onClose={() => setEditor(null)}
          />
        )}
        <div className="event-showcase-list">
          {groupEvents.map((event) => (
            <EventCard event={event} key={event.id} />
          ))}
        </div>
      </section>
    );
  });
}
