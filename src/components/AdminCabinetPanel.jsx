import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteAdminPassword,
  deleteAdminProfile,
  createAdminNfcTags,
  getAdminAuditLogs,
  getAdminNfcTags,
  getAdminPasswords,
  getAdminProfiles,
  updateAdminNfcTag,
  updateAdminProfile,
  upsertAdminPassword,
  unlockAdminVault,
} from "../services/adminService";
import { useAuth } from "../context/AuthContext";

const tabs = [
  { id: "profiles", label: "Участники" },
  { id: "tags", label: "Метки" },
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

const encryptedPrefix = "enc:v1:";

function toBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function fromBase64(value) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function getVaultKey(pin, salt) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 180000, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encryptSecret(pin, secret) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getVaultKey(pin, salt);
  const encoded = new TextEncoder().encode(JSON.stringify({
    login: secret.login,
    password_value: secret.password_value,
    url: secret.url,
    notes: secret.notes,
  }));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  return `${encryptedPrefix}${toBase64(new TextEncoder().encode(JSON.stringify({
    salt: toBase64(salt),
    iv: toBase64(iv),
    cipher: toBase64(cipher),
  })))}`;
}

async function decryptSecret(pin, item) {
  if (!item.password_value?.startsWith(encryptedPrefix)) {
    return {
      login: item.login || "",
      password_value: item.password_value || "",
      url: item.url || "",
      notes: item.notes || "",
      isLegacy: true,
    };
  }

  const payload = JSON.parse(new TextDecoder().decode(fromBase64(item.password_value.slice(encryptedPrefix.length))));
  const salt = fromBase64(payload.salt);
  const iv = fromBase64(payload.iv);
  const cipher = fromBase64(payload.cipher);
  const key = await getVaultKey(pin, salt);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
  return JSON.parse(new TextDecoder().decode(plain));
}

function ProfilesPanel() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [roleDrafts, setRoleDrafts] = useState({});
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const { data: profileResult = { items: [], total: 0 }, error } = useQuery({ queryKey: ["admin-profiles", search.trim(), showAll], queryFn: () => getAdminProfiles({ search, all: showAll }) });
  const data = profileResult.items;
  const updateMutation = useMutation({
    mutationFn: ({ profileId, values }) => updateAdminProfile(profileId, values, profile),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-profiles"] }),
  });
  const deleteMutation = useMutation({
    mutationFn: (profileId) => deleteAdminProfile(profileId, profile),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-profiles"] }),
  });

  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLowerCase();
    const sorted = [...data].sort((first, second) => String(first.nickname || "").localeCompare(String(second.nickname || ""), "ru"));
    return sorted;
  }, [data, search]);

  const visibleProfiles = filteredProfiles;
  const getRoleValue = (item) => roleDrafts[item.id] ?? item.role_badge ?? "";

  return (
    <article className="info-card admin-panel">
      <div className="admin-panel-head">
        <div>
          <p className="card-kicker">Роли и модерация</p>
          <h2>Участники</h2>
        </div>
        <label className="admin-search">
          <span>Поиск</span>
          <input
            value={search}
            placeholder="Никнейм или ИСУ"
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>
      {error && <p className="form-error">{error.message}</p>}
      <div className="admin-table">
        {visibleProfiles.map((item) => (
          <div
            className={`admin-list-row admin-list-row--profile admin-profile-row${item.is_banned ? " admin-profile-row--banned" : ""}`}
            key={item.id}
          >
            <div>
              <strong>{item.nickname}</strong>
              <span>
                ИСУ {item.isu_number} · {item.faculty || "без фака"}
                {item.is_banned ? " · БАН" : ""}
                {item.is_admin ? " · админ" : ""}
              </span>
            </div>

            <label className="admin-role-field">
              <span>Роль / метка</span>
              <input
                value={getRoleValue(item)}
                placeholder="Ведущий, фотограф, лучший мемолог…"
                onChange={(event) => setRoleDrafts((current) => ({ ...current, [item.id]: event.target.value }))}
              />
            </label>

            <div className="admin-row-actions">
              <a className="admin-row-link" href={`/u/${item.id}`} target="_blank" rel="noreferrer">Профиль</a>
              <button
                type="button"
                onClick={() => updateMutation.mutate({ profileId: item.id, values: { role_badge: getRoleValue(item).trim() || null } })}
              >
                Сохранить
              </button>
              <button type="button" onClick={() => updateMutation.mutate({ profileId: item.id, values: { is_admin: !item.is_admin } })}>
                {item.is_admin ? "Убрать админа" : "Сделать админом"}
              </button>
              <button
                className={item.is_banned ? "admin-danger-button admin-danger-button--active" : "admin-danger-button"}
                type="button"
                onClick={() => updateMutation.mutate({ profileId: item.id, values: { is_banned: !item.is_banned } })}
              >
                {item.is_banned ? "Разбанить" : "Бан"}
              </button>
              <button type="button" onClick={() => deleteMutation.mutate(item.id)}>Удалить</button>
            </div>
          </div>
        ))}
      </div>
      {!search.trim() && profileResult.total > 10 && (
        <button className="admin-show-all" type="button" onClick={() => setShowAll((value) => !value)}>
          {showAll ? "Показать первые 10" : `Открыть весь список (${profileResult.total})`}
        </button>
      )}
    </article>
  );
}

function TagsPanel() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [newTagCount, setNewTagCount] = useState(1);
  const [newTagType, setNewTagType] = useState("card");
  const { data = [], error } = useQuery({ queryKey: ["admin-nfc-tags"], queryFn: getAdminNfcTags });
  const updateMutation = useMutation({
    mutationFn: ({ tagId, values }) => updateAdminNfcTag(tagId, values, profile),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-nfc-tags"] }),
  });
  const createMutation = useMutation({
    mutationFn: () => createAdminNfcTags({ count: Number(newTagCount), tagType: newTagType, labelPrefix: "Метка" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-nfc-tags"] }),
  });

  const visibleTags = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data;
    return data.filter((tag) => (
      String(tag.code || "").toLowerCase().includes(query) ||
      String(tag.label || "").toLowerCase().includes(query) ||
      String(tag.profile?.nickname || "").toLowerCase().includes(query) ||
      String(tag.profile?.isu_number || "").includes(query)
    ));
  }, [data, search]);

  return (
    <article className="info-card admin-panel">
      <div className="admin-panel-head">
        <div>
          <p className="card-kicker">NFC</p>
          <h2>Метки</h2>
        </div>
        <label className="admin-search">
          <span>Поиск</span>
          <input value={search} placeholder="Код, никнейм, ИСУ" onChange={(event) => setSearch(event.target.value)} />
        </label>
      </div>
      {error && <p className="form-error">{error.message}</p>}
      <div className="admin-row-actions admin-tag-create">
        <input type="number" min="1" max="500" value={newTagCount} onChange={(event) => setNewTagCount(event.target.value)} aria-label="Количество новых меток" />
        <select value={newTagType} onChange={(event) => setNewTagType(event.target.value)} aria-label="Тип новых меток">
          <option value="keychain">Брелок</option><option value="card">Карта</option><option value="removable">Съёмная</option><option value="sticker">Стикер</option><option value="other">Другое</option>
        </select>
        <button type="button" disabled={createMutation.isPending} onClick={() => createMutation.mutate()}>Создать метки</button>
      </div>
      <div className="admin-list">
        {visibleTags.map((tag) => (
          <div className="admin-list-row admin-tag-row" key={tag.id}>
            <div>
              <strong>{tag.label || "Без названия"}</strong>
              <span>
                {tag.code} · {tag.tag_type || "метка"} · {tag.is_active ? "активна" : "выключена"}
              </span>
              <span>
                Владелец: {tag.profile ? `${tag.profile.nickname} · ИСУ ${tag.profile.isu_number}` : "не привязана"}
              </span>
            </div>
            <div className="admin-row-actions">
              {tag.profile?.id && <a className="admin-row-link" href={`/u/${tag.profile.id}`} target="_blank" rel="noreferrer">Профиль</a>}
              <button
                type="button"
                onClick={() => updateMutation.mutate({ tagId: tag.id, values: { is_active: !tag.is_active } })}
              >
                {tag.is_active ? "Выключить" : "Включить"}
              </button>
              {tag.profile_id && (
                <button
                  type="button"
                  onClick={() => updateMutation.mutate({ tagId: tag.id, values: { profile_id: null, claimed_at: null } })}
                >
                  Отвязать
                </button>
              )}
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
  const [isAdding, setIsAdding] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [vaultPin, setVaultPin] = useState("");
  const [opened, setOpened] = useState({});
  const [vaultError, setVaultError] = useState("");
  const { data = [], error } = useQuery({ queryKey: ["admin-passwords"], queryFn: getAdminPasswords });
  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (!vaultPin) throw new Error("Сначала открой vault четырёхзначным кодом");
      const encrypted = await encryptSecret(vaultPin, payload);
      return upsertAdminPassword({
        id: payload.id,
        title: payload.title,
        login: null,
        password_value: encrypted,
        url: null,
        notes: null,
      }, profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-passwords"] });
      setForm(emptyPassword);
      setIsAdding(false);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (secretId) => deleteAdminPassword(secretId, profile),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-passwords"] }),
  });

  const openVault = async () => {
    if (/^\d{4}$/.test(pinInput)) {
      try {
        await unlockAdminVault(pinInput);
        setVaultPin(pinInput);
        setVaultError("");
        queryClient.invalidateQueries({ queryKey: ["admin-passwords"] });
      } catch (error) { setVaultError(error.message); }
      return;
    }
    setVaultError("Код должен быть из 4 цифр");
  };

  const revealSecret = async (item) => {
    if (!vaultPin) {
      setVaultError("Сначала введи 4-значный код");
      return;
    }
    try {
      const decrypted = await decryptSecret(vaultPin, item);
      setOpened((current) => ({ ...current, [item.id]: decrypted }));
      setVaultError("");
    } catch {
      setVaultError("Не удалось расшифровать. Скорее всего, код другой.");
    }
  };

  const editSecret = async (item) => {
    if (!vaultPin) {
      setVaultError("Сначала введи 4-значный код");
      return;
    }
    try {
      const decrypted = opened[item.id] || await decryptSecret(vaultPin, item);
      setForm({ ...emptyPassword, ...decrypted, id: item.id, title: item.title });
      setIsAdding(true);
      setVaultError("");
    } catch {
      setVaultError("Не удалось расшифровать. Скорее всего, код другой.");
    }
  };

  return (
    <div className="admin-grid">
      <article className="info-card admin-panel">
        <p className="card-kicker">Vault</p>
        <h2>Пароли</h2>
        <div className="admin-pin-box">
          <label className="form-field">
            <span>Код открытия</span>
            <input
              inputMode="numeric"
              maxLength="4"
              value={pinInput}
              placeholder="4 цифры"
              onChange={(event) => setPinInput(event.target.value.replace(/\D/g, "").slice(0, 4))}
            />
          </label>
          <button type="button" onClick={openVault}>{vaultPin ? "Код активен" : "Открыть"}</button>
        </div>
        {vaultError && <p className="form-error">{vaultError}</p>}
        <button className="admin-show-all" type="button" onClick={() => setIsAdding((value) => !value)}>
          {isAdding ? "Закрыть добавление" : "Добавить пароль"}
        </button>
        {isAdding && (
          <form className="admin-form admin-form--nested" onSubmit={(event) => { event.preventDefault(); saveMutation.mutate(form); }}>
            <label className="form-field"><span>Название</span><input name="title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required /></label>
            <label className="form-field"><span>Логин</span><input name="login" value={form.login} onChange={(event) => setForm((current) => ({ ...current, login: event.target.value }))} /></label>
            <label className="form-field"><span>Пароль</span><input name="password_value" value={form.password_value} onChange={(event) => setForm((current) => ({ ...current, password_value: event.target.value }))} /></label>
            <label className="form-field"><span>URL</span><input name="url" value={form.url} onChange={(event) => setForm((current) => ({ ...current, url: event.target.value }))} /></label>
            <label className="form-field"><span>Заметки</span><textarea name="notes" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} rows="3" /></label>
            {saveMutation.error && <p className="form-error">{saveMutation.error.message}</p>}
            <button className="text-button auth-submit" type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Шифруем…" : "Сохранить"}
            </button>
          </form>
        )}
      </article>
      <article className="info-card admin-panel">
        <p className="card-kicker">Список</p>
        <h2>Доступы</h2>
        {error && <p className="form-error">{error.message}</p>}
        <div className="admin-list">
          {data.map((item) => {
            const secret = opened[item.id];
            return (
              <div className="admin-list-row" key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <span>{secret ? `${secret.login || "без логина"} · ${secret.url || "без ссылки"}` : "зашифровано"}</span>
                  {secret?.password_value && <code>{secret.password_value}</code>}
                  {secret?.isLegacy && <span>старый формат, пересохрани запись для шифрования</span>}
                </div>
                <div className="admin-row-actions">
                  <button type="button" onClick={() => revealSecret(item)}>Открыть</button>
                  <button type="button" onClick={() => editSecret(item)}>Изменить</button>
                  <button type="button" onClick={() => deleteMutation.mutate(item.id)}>Удалить</button>
                </div>
              </div>
            );
          })}
        </div>
      </article>
    </div>
  );
}

const actionLabels = {
  "profile.update": "Профиль обновлён",
  "profile.delete": "Профиль удалён",
  "password.create": "Пароль добавлен",
  "password.update": "Пароль обновлён",
  "password.delete": "Пароль удалён",
  "event.create": "Мероприятие добавлено",
  "event.update": "Мероприятие обновлено",
  "event.delete": "Мероприятие удалено",
  "tag.update": "Метка обновлена",
};

function LogsPanel() {
  const [search, setSearch] = useState("");
  const { data = [], error } = useQuery({ queryKey: ["admin-audit-logs"], queryFn: getAdminAuditLogs });
  const visibleLogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    const logs = query
      ? data.filter((item) => `${actionLabels[item.action] || item.action} ${item.actor?.nickname || ""} ${item.entity_type || ""}`.toLowerCase().includes(query))
      : data;
    return logs.slice(0, 10);
  }, [data, search]);

  return (
    <article className="info-card admin-panel">
      <div className="admin-panel-head">
        <div>
          <p className="card-kicker">Последние 10 из 50</p>
          <h2>Логи</h2>
        </div>
        <label className="admin-search">
          <span>Поиск</span>
          <input value={search} placeholder="Действие или админ" onChange={(event) => setSearch(event.target.value)} />
        </label>
      </div>
      {error && <p className="form-error">{error.message}</p>}
      <div className="admin-list">
        {visibleLogs.map((item) => (
          <div className="admin-list-row" key={item.id}>
            <div>
              <strong>{actionLabels[item.action] || item.action}</strong>
              <span>
                {item.actor?.nickname || "system"} · {new Date(item.created_at).toLocaleString("ru-RU")}
              </span>
            </div>
            <code>{item.entity_id || item.entity_type}</code>
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
      {activeTab === "tags" && <TagsPanel />}
      {activeTab === "passwords" && <PasswordsPanel />}
      {activeTab === "logs" && <LogsPanel />}
    </section>
  );
}
