import { Api } from "../api";
import { getProfileSocialLinks, getSocialLinkStyle } from "../utils/socialLinks";

export default function ProfileCard({ profile, actions, compact = false }) {
  if (!profile) {
    return null;
  }

  const avatar = profile.avatar_url || Api.normalizeURL("/images/people/member.jpg");
  const publicLinks = getProfileSocialLinks(profile);

  return (
    <article className={`info-card public-profile-card${compact ? " public-profile-card--compact" : ""}`}>
      <div className="public-profile-avatar">
        <img src={avatar} alt={profile.nickname} />
        <span className="public-profile-avatar__status"><i /> PLAYER ONLINE</span>
        <b className="public-profile-avatar__id">MB#{String(profile.id || "0000").slice(0, 4).toUpperCase()}</b>
      </div>

      <div className="public-profile-info">
        <p className="card-kicker">{profile.faculty || "Megabattle"}</p>
        <h2>{profile.nickname}</h2>
        <span className="public-profile-level">УРОВЕНЬ · {Math.max(1, Math.floor((Number(profile.megaballs) || 0) / 100) + 1).toString().padStart(2, "0")}</span>
        {profile.full_name && <p className="profile-real-name">{profile.full_name}</p>}
        {profile.bio && <p className="profile-bio">{profile.bio}</p>}

        <div className="pill-row">
          {profile.role_badge && <span className="pill">{profile.role_badge}</span>}
          {profile.is_best_actor && !profile.role_badge && <span className="pill">Лучший актёр</span>}
          {profile.is_admin && <span className="pill">админ</span>}
          {profile.megaballs > 0 && <span className="pill">{profile.megaballs} мегабаллов</span>}
        </div>

        <div className="profile-socials">
          {publicLinks.map((item) => (
            <a
              className={`social-link-button social-link-button--${item.brand} social-link-button--${item.style || "soft"}`}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              style={getSocialLinkStyle(item)}
              key={item.url}
            >
              {item.title}
            </a>
          ))}
        </div>

        {actions && <div className="profile-actions">{actions}</div>}
      </div>
    </article>
  );
}
