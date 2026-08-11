import { useQuery } from "@tanstack/react-query";
import { Api } from "../api";
import { getProfileSocialLinks, getSocialLinkStyle } from "../utils/socialLinks";
import GamificationWidget from "./GamificationWidget";
import { backendApi } from "../lib/backendApi";

export function Leaderboard({ title, rows }) {
  return (
    <div className="info-card faculty-leaderboard-card">
      <h2>{title}</h2>
      <div className="leaderboard">
        {rows.map((item) => (
          <div className={`leaderboard-row leaderboard-row--place-${item.place}`} key={`${item.place}-${item.name}`}>
            <span className="leaderboard-place">{item.place}</span>
            <strong>{item.name}</strong>
            <em>{item.badge || item.faculty}</em>
            <b>{item.score} МБ</b>
          </div>
        ))}
        {!rows.length && <p className="leaderboard-empty">Таблица пока не заполнена.</p>}
      </div>
    </div>
  );
}

export function RatingsOverview() {
  const ratings = useQuery({
    queryKey: ["ratings"],
    queryFn: Api.getRatings,
    placeholderData: {
      facultyLeaderboard: [],
    },
  }).data;

  return (
    <div className="ratings-overview">
      <Leaderboard title="Рейтинг факультетов по мегабаллам" rows={ratings.facultyLeaderboard} />
    </div>
  );
}

export function AuthenticatedRatingPanel({ profile, onEditProfile, onPreviewCard, onSignOut }) {
  const game = useQuery({ queryKey: ["game-dashboard", profile?.id], queryFn: () => backendApi("/api/v1/game/dashboard"), enabled: Boolean(profile?.id) }).data;

  const participantScore = game?.level?.xp ?? 0;
  const displayName = profile?.nickname || profile?.full_name || "Участник";
  const avatar = profile?.avatar_url || Api.normalizeURL("/images/people/member.jpg");
  const links = getProfileSocialLinks(profile).slice(0, 4);

  return (
    <div className="authenticated-rating-grid">
      <article className="info-card participant-profile-card player-card-v2">
        <div className="participant-profile-avatar">
          <img src={avatar} alt={displayName} />
        </div>
        <div className="participant-profile-content">
          <h2>{displayName}</h2>
          {profile?.bio && <p className="profile-bio">{profile.bio}</p>}

          <div className="participant-profile-socials">
            {links.map((item) => (
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

          <div className="profile-actions">
            <button className="text-button" type="button" onClick={onEditProfile}>
              Редактировать профиль
            </button>
            <button className="text-button" type="button" onClick={onPreviewCard}>
              Предпросмотр визитки
            </button>
            <button className="text-button" type="button" onClick={onSignOut}>
              Выйти
            </button>
          </div>
        </div>
      </article>

      <GamificationWidget
        profile={{ ...profile, achievements: game?.achievements }}
        score={game?.level?.xp ?? participantScore}
        socialCount={links.length}
      />
    </div>
  );
}
