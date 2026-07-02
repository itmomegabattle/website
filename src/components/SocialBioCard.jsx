import { Link } from "react-router-dom";
import { useState } from "react";
import { Api } from "../api";
import { getProfileSocialLinks, getSocialLinkStyle } from "../utils/socialLinks";

function getQrUrl(url) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=16&data=${encodeURIComponent(url)}`;
}

export default function SocialBioCard({ profile, actions, qrOnSocials = false }) {
  const [qrLink, setQrLink] = useState(null);
  if (!profile) return null;

  const avatar = profile.avatar_url || Api.normalizeURL("/images/people/member.jpg");
  const links = getProfileSocialLinks(profile);

  const handleSocialClick = (event, item) => {
    if (!qrOnSocials) return;
    event.preventDefault();
    setQrLink(item);
  };

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
              <a
                className={`social-link-button social-link-button--${item.brand} social-link-button--${item.style || "soft"}`}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                style={getSocialLinkStyle(item)}
                onClick={(event) => handleSocialClick(event, item)}
                key={item.url}
              >
                {item.title}
              </a>
            ))
          ) : (
            <Link to={`/u/${profile.id}`}>Открыть профиль</Link>
          )}
        </div>

        {actions && <div className="social-bio-actions">{actions}</div>}
      </div>

      {qrLink && (
        <div className="qr-popover" role="dialog" aria-label={`QR для ${qrLink.title}`}>
          <button type="button" className="qr-popover-close" onClick={() => setQrLink(null)}>
            ×
          </button>
          <p className="card-kicker">QR</p>
          <h2>{qrLink.title}</h2>
          <img src={getQrUrl(qrLink.url)} alt={`QR ${qrLink.title}`} />
          <a href={qrLink.url} target="_blank" rel="noreferrer">
            Открыть ссылку
          </a>
        </div>
      )}
    </article>
  );
}
