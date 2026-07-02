import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile, uploadAvatar } from "../services/profileService";

const emptySocialLink = { title: "", url: "" };

export default function ProfileEditor() {
  const { profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    nickname: "",
    full_name: "",
    faculty: "",
    bio: "",
    telegram_username: "",
    instagram_username: "",
    social_links: [emptySocialLink],
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile) return;
    setForm({
      nickname: profile.nickname ?? "",
      full_name: profile.full_name ?? "",
      faculty: profile.faculty ?? "",
      bio: profile.bio ?? "",
      telegram_username: profile.telegram_username ?? "",
      instagram_username: profile.instagram_username ?? "",
      social_links: profile.social_links?.length ? profile.social_links : [emptySocialLink],
    });
  }, [profile]);

  if (!profile) {
    return null;
  }

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const updateSocialLink = (index, field, value) => {
    setForm((current) => ({
      ...current,
      social_links: current.social_links.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addSocialLink = () => {
    setForm((current) => ({
      ...current,
      social_links: [...current.social_links, emptySocialLink],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("Сохраняем профиль…");

    try {
      let avatarUrl = profile.avatar_url;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(profile.id, avatarFile);
      }

      await updateProfile(profile.id, {
        ...form,
        avatar_url: avatarUrl,
        social_links: form.social_links.filter((item) => item.title || item.url),
      });
      await refreshProfile();
      setStatus("Профиль сохранён");
    } catch (submitError) {
      setError(submitError.message);
      setStatus("");
    }
  };

  return (
    <form className="info-card profile-editor" onSubmit={handleSubmit}>
      <p className="card-kicker">Личный кабинет</p>
      <h2>Редактировать профиль</h2>

      <label className="form-field">
        <span>Никнейм</span>
        <input name="nickname" value={form.nickname} onChange={updateField} required />
      </label>

      <label className="form-field">
        <span>Имя</span>
        <input name="full_name" value={form.full_name} onChange={updateField} />
      </label>

      <label className="form-field">
        <span>Факультет</span>
        <input name="faculty" value={form.faculty} onChange={updateField} />
      </label>

      <label className="form-field">
        <span>Описание</span>
        <textarea name="bio" value={form.bio} onChange={updateField} rows="4" />
      </label>

      <label className="form-field">
        <span>Telegram</span>
        <input
          name="telegram_username"
          value={form.telegram_username}
          onChange={updateField}
          placeholder="@username"
        />
      </label>

      <label className="form-field">
        <span>Instagram</span>
        <input
          name="instagram_username"
          value={form.instagram_username}
          onChange={updateField}
          placeholder="@username"
        />
      </label>

      <label className="form-field">
        <span>Фото профиля</span>
        <input type="file" accept="image/*" onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)} />
      </label>

      <div className="social-links-editor">
        <span>Ссылки</span>
        {form.social_links.map((item, index) => (
          <div className="social-link-row" key={index}>
            <input
              value={item.title}
              onChange={(event) => updateSocialLink(index, "title", event.target.value)}
              placeholder="Название"
            />
            <input
              value={item.url}
              onChange={(event) => updateSocialLink(index, "url", event.target.value)}
              placeholder="https://..."
            />
          </div>
        ))}
        <button className="text-button" type="button" onClick={addSocialLink}>
          Добавить ссылку
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}
      {status && <p className="form-status">{status}</p>}

      <button className="text-button auth-submit" type="submit">
        Сохранить
      </button>
    </form>
  );
}
