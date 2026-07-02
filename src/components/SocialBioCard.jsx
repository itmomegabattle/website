import { Link } from "react-router-dom";
import { Api } from "../api";

function normalizeHandle(value) {
  return String(value || "").replace(/^@/, "").trim();
}

function getSocialLinks(profile) {
  const links = [];
  const telegram = normalizeHandle(profile.telegram_username);
  const instagram = normalizeHandle(profile.instagram_username);

  if (telegram) {
    links.push({
      title: "Telegram",
      url: telegram.startsWith("http") ? telegram : `https://t.me/${telegram}`,
    });
  }

  if (instagram) {
    links.push({
      title: "Instagram",
      url: instagram.startsWith("http") ? instagram : `https://instagram.com/${instagram}`,
    });
  }

  profile.social_links
    ?.filter((item) => item.title && item.url)
    .forEach((item) => links.push(item));

  return links;
}

export default function SocialBioCard({ profile, actions }) {
  if (!profile) return null;

  const avatar = profile.avatar_url || Api.normalizeURL("/images/people/member.jpg");
  const links = getSocialLinks(profile);

  return (
    <article className="social-bio-card">
      <div className="social-bio-avatar">
        <img src={avatar} alt={profile.nickname} />
      </div>

      <div className="social-bio-content">
        <p className="social-bio-faculty">{profile.faculty || "ITMO Megabattle"}</p>
        <h1>{profile.nickname}</h1>
        {profile.full_name && <p className="social-bio-name">{profile.full_name}</p>}
        {profile.bio && <p className="social-bio-text">{profile.bio}</p>}

        <div className="social-bio-links">
          {links.length > 0 ? (
            links.map((item) => (
              <a href={item.url} target="_blank" rel="noreferrer" key={item.url}>
                {item.title}
              </a>
            ))
          ) : (
            <Link to={`/u/${profile.id}`}>Открыть профиль</Link>
          )}
        </div>

        {actions && <div className="social-bio-actions">{actions}</div>}
      </div>
    </article>
  );
}
