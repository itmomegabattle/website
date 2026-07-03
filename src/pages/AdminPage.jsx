import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import {
  deleteAdminEvent,
  deleteAdminPassword,
  deleteAdminProfile,
  getAdminAuditLogs,
  getAdminEvents,
  getAdminPasswords,
  getAdminProfiles,
  isAdminProfile,
  updateAdminProfile,
  uploadAdminEventImage,
  upsertAdminEvent,
  upsertAdminPassword,
} from "../services/adminService";
import { useAuth } from "../context/AuthContext";
import "../styles/page-info.css";

const tabs = [
  { id: "events", label: "Мероприятия" },
  { id: "profiles", label: "Участники" },
  { id: "passwords", label: "Пароли" },
  { id: "logs", label: "Логи" },
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

const emptyPassword = {
  title: "",
  login: "",
  password_value: "",
  url: "",
  notes: "",
};

function toSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function AdminGate({ children }) {
  const { isAuthenticated, isLoading, profile } = useAuth();

  if (isLoading) {
    return (
      <main className="info-page structured-page admin-page">
        <section className="main-width info-card">
          <h1>Проверяем доступ…</h1>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth?redirect=/admin" replace />;
  }

  if (!isAdminProfile(profile)) {
    return (
      <main className="info-page structured-page admin-page">
        <section className="main-width info-card">
          <p className="card-kicker">Admin</p>
          <h1>Нет доступа</h1>
          <p>Админка доступна только профилям с ролью админа.</p>
        </section>
      </main>
    );
  }

  return children;
}

function EventForm({ selectedEvent, onDone }) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(() => selectedEvent || emptyEvent);
  const [detailsText, setDetailsText] = useState(() => (selectedEvent?.details || []).join("\n"));
  const [status, setStatus] = useState("");

  const saveMutation = useMutation({
    mutationFn: (payload) => upsertAdminEvent(payload, profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      setStatus("Событие сохранено");
      onDone?.();
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
      details: detailsText.split("\n").map((item) => item.trim()).filter(Boolean),
    });
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-form-grid">
        <label className="form-field">
          <span>Название</span>
          <input name="name" value={form.name} onChange={updateField} required />
        </label>
        <label className="form-field">
          <span>Slug</span>
          <input name="slug" value={form.slug} onChange={updateField} required />
        </label>
        <label className="form-field">
          <span>Группа</span>
          <select name="group_key" value={form.group_key} onChange={updateField}>
            <option value="megabattle">Megabattle</option>
            <option value="partners">Партнёры</option>
          </select>
        </label>
        <label className="form-field">
          <span>Статус</span>
          <select name="status" value={form.status} onChange={updateField}>
            <option value="draft">Черновик</option>
            <option value="published">Опубликовано</option>
            <option value="archived">Архив</option>
          </select>
        </label>
        <label className="form-field">
          <span>Тип</span>
          <input name="type" value={form.type || ""} onChange={updateField} />
        </label>
        <label className="form-field">
          <span>Сортировка</span>
          <input name="sort_order" type="number" value={form.sort_order} onChange={updateField} />
        </label>
        <label className="form-field">
          <span>Дата</span>
          <input name="event_date_label" value={form.event_date_label || ""} onChange={updateField} />
        </label>
        <label className="form-field">
          <span>Время</span>
          <input name="event_time_label" value={form.event_time_label || ""} onChange={updateField} />
        </label>
        <label className="form-field">
          <span>Место</span>
          <input name="location" value={form.location || ""} onChange={updateField} />
        </label>
        <label className="form-field">
          <span>Фото</span>
          <input type="file" accept="image/*" onChange={handleImage} />
        </label>
      </div>

      <label className="form-field">
        <span>Ссылка на фото</span>
        <input name="image_url" value={form.image_url || ""} onChange={updateField} />
      </label>

      <label className="form-field">
        <span>Описание</span>
        <textarea name="description" rows="4" value={form.description || ""} onChange={updateField} />
      </label>

      <label className="form-field">
        <span>Детали, каждая с новой строки</span>
        <textarea rows="3" value={detailsText} onChange={(event) => setDetailsText(event.target.value)} />
      </label>

      <div className="admin-form-grid">
        <label className="form-field">
          <span>Регистрация</span>
          <select name="registration_status" value={form.registration_status} onChange={updateField}>
            <option value="open">Открыта</option>
            <option value="soon">Скоро</option>
            <option value="closed">Закрыта</option>
          </select>
        </label>
        <label className="form-field">
          <span>Текст кнопки</span>
          <input name="registration_label" value={form.registration_label || ""} onChange={updateField} />
        </label>
        <label className="form-field">
          <span>Ссылка регистрации</span>
          <input name="registration_link" value={form.registration_link || ""} onChange={updateField} />
        </label>
        <label className="form-field">
          <span>ID ITMO Events</span>
          <input name="itmo_events_id" value={form.itmo_events_id || ""} onChange={updateField} />
        </label>
      </div>

      {saveMutation.error && <p className="form-error">{saveMutation.error.message}</p>}
      {status && <p className="form-status">{status}</p>}

      <button className="text-button auth-submit" type="submit" disabled={saveMutation.isPending}>
        {saveMutation.isPending ? "Сохраняем…" : "Сохранить событие"}
      </button>
    </form>
  );
}

function EventsAdmin() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { data = [], error } = useQuery({ queryKey: ["admin-events"], queryFn: getAdminEvents });
  const deleteMutation = useMutation({
    mutationFn: (eventId) => deleteAdminEvent(eventId, profile),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-events"] }),
  });

  return (
    <div className="admin-grid">
      <article className="info-card admin-panel admin-panel--form">
        <p className="card-kicker">CRUD</p>
        <h2>{selectedEvent ? "Редактировать событие" : "Новое событие"}</h2>
        <EventForm selectedEvent={selectedEvent} onDone={() => setSelectedEvent(null)} key={selectedEvent?.id || "new"} />
      </article>

      <article className="info-card admin-panel">
        <p className="card-kicker">Список</p>
        <h2>Мероприятия</h2>
        {error && <p className="form-error">{error.message}</p>}
        <div className="admin-list">
          {data.map((event) => (
            <div className="admin-list-row" key={event.id}>
              <div>
                <strong>{event.name}</strong>
                <span>{event.group_key} · {event.status}</span>
              </div>
              <div className="admin-row-actions">
                <button type="button" onClick={() => setSelectedEvent(event)}>Изменить</button>
                <button type="button" onClick={() => deleteMutation.mutate(event.id)}>Удалить</button>
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

function ProfilesAdmin() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { data = [], error } = useQuery({ queryKey: ["admin-profiles"], queryFn: getAdminProfiles });
  const updateMutation = useMutation({
    mutationFn: ({ profileId, values }) => updateAdminProfile(profileId, values, profile),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-profiles"] }),
  });
  const deleteMutation = useMutation({
    mutationFn: (profileId) => deleteAdminProfile(profileId, profile),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-profiles"] }),
  });

  return (
    <article className="info-card admin-panel">
      <p className="card-kicker">Роли и модерация</p>
      <h2>Участники</h2>
      {error && <p className="form-error">{error.message}</p>}
      <div className="admin-table">
        {data.map((item) => (
          <div className="admin-list-row admin-list-row--profile" key={item.id}>
            <div>
              <strong>{item.nickname}</strong>
              <span>ИСУ {item.isu_number} · {item.faculty || "без фака"}</span>
            </div>
            <div className="admin-row-actions">
              <button type="button" onClick={() => updateMutation.mutate({ profileId: item.id, values: { is_admin: !item.is_admin } })}>
                {item.is_admin ? "Убрать админа" : "Сделать админом"}
              </button>
              <button type="button" onClick={() => updateMutation.mutate({ profileId: item.id, values: { is_banned: !item.is_banned } })}>
                {item.is_banned ? "Разбанить" : "Бан"}
              </button>
              <button type="button" onClick={() => updateMutation.mutate({ profileId: item.id, values: { is_best_actor: !item.is_best_actor } })}>
                {item.is_best_actor ? "Снять актёра" : "Лучший актёр"}
              </button>
              <button type="button" onClick={() => deleteMutation.mutate(item.id)}>Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function PasswordsAdmin() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyPassword);
  const { data = [], error } = useQuery({ queryKey: ["admin-passwords"], queryFn: getAdminPasswords });
  const saveMutation = useMutation({
    mutationFn: (payload) => upsertAdminPassword(payload, profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-passwords"] });
      setForm(emptyPassword);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (secretId) => deleteAdminPassword(secretId, profile),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-passwords"] }),
  });

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  return (
    <div className="admin-grid">
      <article className="info-card admin-panel">
        <p className="card-kicker">Vault MVP</p>
        <h2>Пароли проекта</h2>
        <p>Это временный защищённый раздел для команды. Для прод-секретов позже лучше подключить отдельный password manager.</p>
        <form className="admin-form" onSubmit={(event) => { event.preventDefault(); saveMutation.mutate(form); }}>
          <label className="form-field"><span>Название</span><input name="title" value={form.title} onChange={updateField} required /></label>
          <label className="form-field"><span>Логин</span><input name="login" value={form.login} onChange={updateField} /></label>
          <label className="form-field"><span>Пароль</span><input name="password_value" value={form.password_value} onChange={updateField} /></label>
          <label className="form-field"><span>URL</span><input name="url" value={form.url} onChange={updateField} /></label>
          <label className="form-field"><span>Заметки</span><textarea name="notes" value={form.notes} onChange={updateField} rows="3" /></label>
          <button className="text-button auth-submit" type="submit">Сохранить</button>
        </form>
      </article>
      <article className="info-card admin-panel">
        <p className="card-kicker">Список</p>
        <h2>Доступы</h2>
        {error && <p className="form-error">{error.message}</p>}
        <div className="admin-list">
          {data.map((item) => (
            <div className="admin-list-row" key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <span>{item.login || "без логина"} · {item.url || "без ссылки"}</span>
                {item.password_value && <code>{item.password_value}</code>}
              </div>
              <div className="admin-row-actions">
                <button type="button" onClick={() => setForm(item)}>Изменить</button>
                <button type="button" onClick={() => deleteMutation.mutate(item.id)}>Удалить</button>
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

function LogsAdmin() {
  const { data = [], error } = useQuery({ queryKey: ["admin-audit-logs"], queryFn: getAdminAuditLogs });

  return (
    <article className="info-card admin-panel">
      <p className="card-kicker">Audit</p>
      <h2>Последние действия</h2>
      {error && <p className="form-error">{error.message}</p>}
      <div className="admin-list">
        {data.map((item) => (
          <div className="admin-list-row" key={item.id}>
            <div>
              <strong>{item.action}</strong>
              <span>{item.actor?.nickname || "system"} · {item.entity_type} · {new Date(item.created_at).toLocaleString("ru-RU")}</span>
            </div>
            <code>{item.entity_id}</code>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("events");
  const activeTitle = useMemo(() => tabs.find((tab) => tab.id === activeTab)?.label, [activeTab]);

  return (
    <AdminGate>
      <main className="info-page structured-page admin-page">
        <section className="main-width participants-hero">
          <p className="eyebrow">Admin</p>
          <h1>Админка</h1>
        </section>

        <section className="main-width admin-shell">
          <nav className="admin-tabs" aria-label="Разделы админки">
            {tabs.map((tab) => (
              <button
                type="button"
                className={activeTab === tab.id ? "admin-tab admin-tab--active" : "admin-tab"}
                onClick={() => setActiveTab(tab.id)}
                key={tab.id}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="admin-section-title">
            <p className="card-kicker">Раздел</p>
            <h2>{activeTitle}</h2>
          </div>

          {activeTab === "events" && <EventsAdmin />}
          {activeTab === "profiles" && <ProfilesAdmin />}
          {activeTab === "passwords" && <PasswordsAdmin />}
          {activeTab === "logs" && <LogsAdmin />}
        </section>
      </main>
    </AdminGate>
  );
}
