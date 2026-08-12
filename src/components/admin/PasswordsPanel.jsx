import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteAdminPassword,
  getAdminPasswords,
  unlockAdminVault,
  upsertAdminPassword,
} from "../../services/adminService";
import { EMPTY_PASSWORD } from "./adminConfig";
import { decryptSecret, encryptSecret } from "./vaultCrypto";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFigma, faGithub, faGoogle, faInstagram, faTiktok, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faBuilding, faGlobe, faPlay } from "@fortawesome/free-solid-svg-icons";

const PASSWORD_PRESETS = [
  { id: "instagram", title: "Instagram", hint: "Логин или почта", icon: faInstagram },
  { id: "tiktok", title: "TikTok", hint: "Логин или почта", icon: faTiktok },
  { id: "gmail", title: "Gmail", hint: "Адрес Gmail", icon: faGoogle },
  { id: "vercel", title: "Vercel", hint: "Почта аккаунта", mark: "▲" },
  { id: "github", title: "GitHub", hint: "Username или почта", icon: faGithub },
  { id: "rutube", title: "Rutube", hint: "Телефон или почта", mark: "R" },
  { id: "youtube", title: "YouTube", hint: "Google-аккаунт", icon: faYoutube },
  { id: "supabase", title: "Supabase", hint: "Почта аккаунта", mark: "⚡" },
  { id: "figma", title: "Figma", hint: "Почта аккаунта", icon: faFigma },
  { id: "ugile", title: "YouGile", hint: "Почта аккаунта", mark: "U" },
  { id: "building", title: "Билдин", hint: "Логин или почта", icon: faBuilding },
];

const normalizeTitle = (value) => String(value || "").trim().toLowerCase();

function PasswordServiceIcon({ preset, title = "" }) {
  if (preset) {
    return <span className={`password-service-icon service-${preset.id}`} aria-hidden="true">{preset.mark || <FontAwesomeIcon icon={preset.icon || faGlobe} />}</span>;
  }
  return <span className="password-service-icon" aria-hidden="true"><FontAwesomeIcon icon={faGlobe} /></span>;
}

export default function PasswordsPanel() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_PASSWORD);
  const [pinInput, setPinInput] = useState("");
  const [vaultPin, setVaultPin] = useState("");
  const [opened, setOpened] = useState({});
  const [vaultError, setVaultError] = useState("");
  const { data = [], error } = useQuery({ queryKey: ["admin-passwords"], queryFn: getAdminPasswords });

  const closeEditor = () => setForm(EMPTY_PASSWORD);
  const selectPreset = (preset, item) => {
    setVaultError("");
    if (item) {
      editSecret(item);
      return;
    }
    setForm({ ...EMPTY_PASSWORD, title: preset.title });
  };

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (!vaultPin) throw new Error("Сначала открой хранилище четырёхзначным кодом");
      const encrypted = await encryptSecret(vaultPin, payload);
      return upsertAdminPassword({
        id: payload.id,
        title: payload.title,
        login: null,
        password_value: encrypted,
        url: null,
        notes: null,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-passwords"] });
      closeEditor();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteAdminPassword,
    onSuccess: async (_result, id) => {
      setOpened((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-passwords"] });
    },
  });

  const openVault = async () => {
    if (!/^\d{4}$/.test(pinInput)) {
      setVaultError("Введи четырёхзначный код");
      return;
    }
    try {
      await unlockAdminVault(pinInput);
      setVaultPin(pinInput);
      setPinInput("");
      setVaultError("");
      await queryClient.invalidateQueries({ queryKey: ["admin-passwords"] });
    } catch (unlockError) {
      setVaultError(unlockError.message);
    }
  };

  const lockVault = () => {
    sessionStorage.removeItem("mb_vault_pin");
    setVaultPin("");
    setOpened({});
    closeEditor();
  };

  const revealSecret = async (item) => {
    try {
      const decrypted = await decryptSecret(vaultPin, item);
      setOpened((current) => ({ ...current, [item.id]: decrypted }));
      setVaultError("");
    } catch {
      setVaultError("Не удалось расшифровать запись этим кодом");
    }
  };

  const editSecret = async (item) => {
    try {
      const decrypted = opened[item.id] || await decryptSecret(vaultPin, item);
      setOpened((current) => ({ ...current, [item.id]: decrypted }));
      setForm({ ...EMPTY_PASSWORD, ...decrypted, id: item.id, title: item.title });
      setVaultError("");
    } catch {
      setVaultError("Не удалось расшифровать запись этим кодом");
    }
  };

  if (!vaultPin) {
    return (
      <div className="admin-vault-lockscreen">
        <article className="info-card admin-vault-unlock">
          <span className="admin-vault-unlock__eyebrow">Защищённый раздел</span>
          <h2>Доступы команды</h2>
          <p>Один код открывает все рабочие аккаунты. Он не сохраняется после закрытия хранилища.</p>
          <div className="admin-pin-box">
            <input
              aria-label="Четырёхзначный код"
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength="4"
              value={pinInput}
              placeholder="••••"
              onChange={(event) => setPinInput(event.target.value.replace(/\D/g, "").slice(0, 4))}
              onKeyDown={(event) => event.key === "Enter" && openVault()}
            />
            <button type="button" onClick={openVault}>Открыть хранилище</button>
          </div>
          {vaultError && <p className="form-error">{vaultError}</p>}
        </article>
      </div>
    );
  }

  const presetTitles = new Set(PASSWORD_PRESETS.map((preset) => normalizeTitle(preset.title)));
  const customEntries = data.filter((item) => !presetTitles.has(normalizeTitle(item.title)));

  return (
    <section className="admin-vault-workspace">
      <header className="admin-vault-header">
        <div><span>Хранилище открыто</span><h2>Аккаунты команды</h2></div>
        <button type="button" onClick={lockVault}>Закрыть</button>
      </header>
      {(vaultError || error) && <p className="form-error">{vaultError || error.message}</p>}

      <div className="admin-password-grid">
        {PASSWORD_PRESETS.map((preset) => {
          const item = data.find((entry) => normalizeTitle(entry.title) === normalizeTitle(preset.title));
          const secret = item && opened[item.id];
          return (
            <article className={`admin-password-card${item ? " is-saved" : ""}`} key={preset.id}>
              <div className="admin-password-card__top">
                <PasswordServiceIcon preset={preset} />
                <span className="admin-password-card__status">{item ? "сохранено" : "не заполнено"}</span>
              </div>
              <div className="admin-password-card__body">
                <h3>{preset.title}</h3>
                <p>{secret ? secret.login || "Логин не указан" : preset.hint}</p>
                {secret?.password_value && <code>{secret.password_value}</code>}
              </div>
              <div className="admin-password-card__actions">
                {!item && <button type="button" onClick={() => selectPreset(preset)}>Заполнить</button>}
                {item && !secret && <button type="button" onClick={() => revealSecret(item)}>Показать</button>}
                {item && secret && <button type="button" onClick={() => setOpened((current) => ({ ...current, [item.id]: undefined }))}>Скрыть</button>}
                {item && <button type="button" onClick={() => editSecret(item)}>Изменить</button>}
                {item && <button className="is-danger" type="button" onClick={() => deleteMutation.mutate(item.id)}>Удалить</button>}
              </div>
            </article>
          );
        })}
      </div>

      {form.title && (
        <form className="info-card admin-password-editor" onSubmit={(event) => { event.preventDefault(); saveMutation.mutate(form); }}>
          <div className="admin-password-editor__heading">
            <div><span>{form.id ? "Редактирование" : "Новый доступ"}</span><h3>{form.title}</h3></div>
            <button type="button" onClick={closeEditor}>Закрыть</button>
          </div>
          <div className="admin-password-editor__fields">
            <label className="form-field"><span>Логин или почта</span><input autoFocus name="login" value={form.login} onChange={(event) => setForm((current) => ({ ...current, login: event.target.value }))} /></label>
            <label className="form-field"><span>Пароль</span><input name="password_value" value={form.password_value} onChange={(event) => setForm((current) => ({ ...current, password_value: event.target.value }))} /></label>
            <label className="form-field"><span>Ссылка</span><input name="url" type="url" value={form.url} onChange={(event) => setForm((current) => ({ ...current, url: event.target.value }))} /></label>
            <label className="form-field admin-password-editor__notes"><span>Заметки</span><textarea name="notes" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} rows="3" /></label>
          </div>
          {saveMutation.error && <p className="form-error">{saveMutation.error.message}</p>}
          <button className="text-button auth-submit" type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Шифруем…" : "Сохранить доступ"}</button>
        </form>
      )}

      {customEntries.length > 0 && (
        <div className="admin-password-custom">
          <h3>Другие доступы</h3>
          {customEntries.map((item) => <button type="button" key={item.id} onClick={() => editSecret(item)}><PasswordServiceIcon title={item.title} />{item.title}</button>)}
        </div>
      )}
    </section>
  );
}
