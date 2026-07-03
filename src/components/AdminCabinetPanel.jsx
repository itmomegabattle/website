import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteAdminPassword,
  deleteAdminProfile,
  getAdminAuditLogs,
  getAdminPasswords,
  getAdminProfiles,
  updateAdminProfile,
  upsertAdminPassword,
} from "../services/adminService";
import { useAuth } from "../context/AuthContext";

const tabs = [
  { id: "profiles", label: "Участники" },
  { id: "passwords", label: "Пароли" },
  { id: "logs", label: "Логи" },
];

const emptyPassword = {
  title: "",
  login: "",
  password_value: "",
  url: "",
  notes: "",
};

function ProfilesPanel() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [roleDrafts, setRoleDrafts] = useState({});
  const { data = [], error } = useQuery({ queryKey: ["admin-profiles"], queryFn: getAdminProfiles });
  const updateMutation = useMutation({
    mutationFn: ({ profileId, values }) => updateAdminProfile(profileId, values, profile),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-profiles"] }),
  });
  const deleteMutation = useMutation({
    mutationFn: (profileId) => deleteAdminProfile(profileId, profile),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-profiles"] }),
  });

  const getRoleValue = (item) => roleDrafts[item.id] ?? item.role_badge ?? "";

  return (
    <article className="info-card admin-panel">
      <p className="card-kicker">Роли и модерация</p>
      <h2>Участники</h2>
      {error && <p className="form-error">{error.message}</p>}
      <div className="admin-table">
        {data.map((item) => (
          <div className="admin-list-row admin-list-row--profile admin-profile-row" key={item.id}>
            <div>
              <strong>{item.nickname}</strong>
              <span>
                ИСУ {item.isu_number} · {item.faculty || "без фака"}
                {item.is_banned ? " · забанен" : ""}
                {item.is_admin ? " · админ" : ""}
              </span>
            </div>

            <label className="admin-role-field">
              <span>Роль / метка</span>
              <input
                value={getRoleValue(item)}
                placeholder="Лучший актёр, ведущий, фотограф…"
                onChange={(event) => setRoleDrafts((current) => ({ ...current, [item.id]: event.target.value }))}
              />
            </label>

            <div className="admin-row-actions">
              <button
                type="button"
                onClick={() => updateMutation.mutate({ profileId: item.id, values: { role_badge: getRoleValue(item).trim() || null } })}
              >
                Сохранить роль
              </button>
              <button type="button" onClick={() => updateMutation.mutate({ profileId: item.id, values: { is_admin: !item.is_admin } })}>
                {item.is_admin ? "Убрать админа" : "Сделать админом"}
              </button>
              <button type="button" onClick={() => updateMutation.mutate({ profileId: item.id, values: { is_banned: !item.is_banned } })}>
                {item.is_banned ? "Разбанить" : "Бан"}
              </button>
              <button type="button" onClick={() => updateMutation.mutate({ profileId: item.id, values: { is_best_actor: !item.is_best_actor, role_badge: item.is_best_actor ? item.role_badge : "Лучший актёр" } })}>
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

function PasswordsPanel() {
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

  return (
    <div className="admin-grid">
      <article className="info-card admin-panel">
        <p className="card-kicker">Vault MVP</p>
        <h2>Пароли проекта</h2>
        <form className="admin-form" onSubmit={(event) => { event.preventDefault(); saveMutation.mutate(form); }}>
          <label className="form-field"><span>Название</span><input name="title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required /></label>
          <label className="form-field"><span>Логин</span><input name="login" value={form.login} onChange={(event) => setForm((current) => ({ ...current, login: event.target.value }))} /></label>
          <label className="form-field"><span>Пароль</span><input name="password_value" value={form.password_value} onChange={(event) => setForm((current) => ({ ...current, password_value: event.target.value }))} /></label>
          <label className="form-field"><span>URL</span><input name="url" value={form.url} onChange={(event) => setForm((current) => ({ ...current, url: event.target.value }))} /></label>
          <label className="form-field"><span>Заметки</span><textarea name="notes" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} rows="3" /></label>
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

function LogsPanel() {
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

export default function AdminCabinetPanel() {
  const [activeTab, setActiveTab] = useState("profiles");
  const activeTitle = useMemo(() => tabs.find((tab) => tab.id === activeTab)?.label, [activeTab]);

  return (
    <section className="main-width admin-cabinet admin-shell">
      <div className="admin-section-title">
        <p className="card-kicker">Админ-кабинет</p>
        <h2>{activeTitle}</h2>
      </div>

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

      {activeTab === "profiles" && <ProfilesPanel />}
      {activeTab === "passwords" && <PasswordsPanel />}
      {activeTab === "logs" && <LogsPanel />}
    </section>
  );
}
