import { Api } from "../api";

function normalizeSocialUrl(value, prefix) {
  if (!value) return "";
  const clean = value.replace(/^@/, "").trim();
  if (clean.startsWith("http")) return clean;
  return `${prefix}${clean}`;
}

export default function ProfileCard({ profile, actions, compact = false }) {
  if (!profile) {
    return null;
  }

  const avatar = profile.avatar_url || Api.normalizeURL("/images/people/member.jpg");
  const telegramUrl = normalizeSocialUrl(profile.telegram_username, "https://t.me/");
  const instagramUrl = normalizeSocialUrl(profile.instagram_username, "https://instagram.com/");
  const publicLinks = profile.social_links?.filter((item) => item.title && item.url) ?? [];

  return (
    <article className={`info-card public-profile-card${compact ? " public-profile-card--compact" : ""}`}>
      <div className="public-profile-avatar">
        <img src={avatar} alt={profile.nickname} />
      </div>

      <div className="public-profile-info">
        <p className="card-kicker">{profile.faculty || "Megabattle"}</p>
        <h2>{profile.nickname}</h2>
        {profile.full_name && <p className="profile-real-name">{profile.full_name}</p>}
        {profile.bio && <p className="profile-bio">{profile.bio}</p>}

        <div className="pill-row">
          {profile.is_admin && <span className="pill">админ</span>}
          {profile.megaballs > 0 && <span className="pill">{profile.megaballs} мегабаллов</span>}
        </div>

        <div className="profile-socials">
          {telegramUrl && (
            <a className="text-button" href={telegramUrl} target="_blank" rel="noreferrer">
              Telegram
            </a>
          )}
          {instagramUrl && (
            <a className="text-button" href={instagramUrl} target="_blank" rel="noreferrer">
              Instagram
            </a>
          )}
          {publicLinks.map((item) => (
            <a className="text-button" href={item.url} target="_blank" rel="noreferrer" key={item.url}>
              {item.title}
            </a>
          ))}
        </div>

        {actions && <div className="profile-actions">{actions}</div>}
      </div>
    </article>
  );
}
