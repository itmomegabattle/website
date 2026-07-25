import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteAdminPassword,
  getAdminPasswords,
  unlockAdminVault,
  upsertAdminPassword,
} from "../../services/adminService";
import { useAuth } from "../../context/AuthContext";
import { EMPTY_PASSWORD } from "./adminConfig";
import { decryptSecret, encryptSecret } from "./vaultCrypto";

export default function PasswordsPanel() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_PASSWORD);
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
      setForm(EMPTY_PASSWORD);
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
      } catch (error) {
        setVaultError(error.message);
      }
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
      setForm({ ...EMPTY_PASSWORD, ...decrypted, id: item.id, title: item.title });
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
            <button className="text-button auth-submit" type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Шифруем…" : "Сохранить"}</button>
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
