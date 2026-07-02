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
