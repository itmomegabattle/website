import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile, uploadAvatar } from "../services/profileService";

const emptySocialLink = { title: "", url: "", color: "#8BA5FF", style: "soft" };
const maxSocialLinks = 3;
const limits = {
  nickname: 18,
  full_name: 34,
  faculty: 24,
  bio: 22,
  handle: 32,
  linkTitle: 24,
};

function limitWords(value, maxWords) {
  return value.trim().split(/\s+/).filter(Boolean).slice(0, maxWords).join(" ");
}

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
      social_links: profile.social_links?.length ? profile.social_links.slice(0, maxSocialLinks) : [emptySocialLink],
    });
  }, [profile]);

  if (!profile) {
    return null;
  }

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === "bio" ? limitWords(value, limits.bio) : value,
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
      social_links:
        current.social_links.length >= maxSocialLinks
          ? current.social_links
          : [...current.social_links, emptySocialLink],
    }));
  };

  const removeSocialLink = (index) => {
    setForm((current) => ({
      ...current,
      social_links:
        current.social_links.length === 1
          ? [emptySocialLink]
          : current.social_links.filter((_, i) => i !== index),
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
        bio: limitWords(form.bio, limits.bio),
        social_links: form.social_links.filter((item) => item.title || item.url).slice(0, maxSocialLinks),
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
      <h2>Редактировать профиль</h2>
      <p>
        Эти данные будут показываться в NFC-визитке. Соцсети и дополнительные
        ссылки можно не заполнять.
      </p>

      <div className="profile-editor-grid">
        <label className="form-field">
          <span>Никнейм</span>
          <input name="nickname" value={form.nickname} onChange={updateField} maxLength={limits.nickname} required />
        </label>

        <label className="form-field">
          <span>Имя</span>
          <input name="full_name" value={form.full_name} onChange={updateField} maxLength={limits.full_name} />
        </label>

        <label className="form-field">
          <span>Факультет</span>
          <input name="faculty" value={form.faculty} onChange={updateField} maxLength={limits.faculty} />
        </label>

        <label className="form-field">
          <span>Фото профиля</span>
          <input type="file" accept="image/*" onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)} />
        </label>
      </div>

      <label className="form-field">
        <span>Описание</span>
        <textarea
          name="bio"
          value={form.bio}
          onChange={updateField}
          rows="4"
          placeholder="Пара слов о себе, роли в проекте или любимом хаосе"
        />
        <small>{form.bio.trim().split(/\s+/).filter(Boolean).length}/{limits.bio} слов</small>
      </label>

      <div className="profile-editor-grid">
        <label className="form-field">
          <span>Telegram</span>
          <input
            name="telegram_username"
            value={form.telegram_username}
            onChange={updateField}
            placeholder="@username"
            maxLength={limits.handle}
          />
        </label>

        <label className="form-field">
          <span>Instagram</span>
          <input
            name="instagram_username"
            value={form.instagram_username}
            onChange={updateField}
            placeholder="@username"
            maxLength={limits.handle}
          />
        </label>
      </div>

      <div className="social-links-editor">
        <span>Ссылки</span>
        {form.social_links.map((item, index) => (
          <div className="social-link-row social-link-row--extended" key={index}>
            <input
              value={item.title}
              onChange={(event) => updateSocialLink(index, "title", event.target.value)}
              placeholder="Название"
              maxLength={limits.linkTitle}
            />
            <input
              value={item.url}
              onChange={(event) => updateSocialLink(index, "url", event.target.value)}
              placeholder="https://..."
            />
            <label className="social-link-color">
              <span>Цвет</span>
              <input
                type="color"
                value={item.color || "#8BA5FF"}
                onChange={(event) => updateSocialLink(index, "color", event.target.value)}
              />
            </label>
            <select
              value={item.style || "soft"}
              onChange={(event) => updateSocialLink(index, "style", event.target.value)}
              aria-label="Оформление ссылки"
            >
              <option value="soft">Мягкая</option>
              <option value="solid">Заливка</option>
              <option value="outline">Обводка</option>
              <option value="glass">Стекло</option>
            </select>
            <button className="social-link-remove" type="button" onClick={() => removeSocialLink(index)}>
              убрать
            </button>
          </div>
        ))}
        <button className="text-button" type="button" onClick={addSocialLink} disabled={form.social_links.length >= maxSocialLinks}>
          {form.social_links.length >= maxSocialLinks ? "Максимум 3 ссылки" : "Добавить ссылку"}
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
