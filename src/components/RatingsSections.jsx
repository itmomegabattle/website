import { useQuery } from "@tanstack/react-query";
import { Api } from "../api";
import { getProfileSocialLinks, getSocialLinkStyle } from "../utils/socialLinks";

function Leaderboard({ title, rows, nameKey = "name" }) {
  return (
    <div className="info-card">
      <h2>{title}</h2>
      <div className="leaderboard">
        {rows.map((item) => (
          <div className="leaderboard-row" key={`${item.place}-${item[nameKey]}`}>
            <span>#{item.place}</span>
            <strong>{item[nameKey]}</strong>
            <em>{item.badge || item.faculty}</em>
            <b>{item.score}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RatingsOverview() {
  const ratings = useQuery({
    queryKey: ["ratings"],
    queryFn: Api.getRatings,
    initialData: {
      facultyLeaderboard: [],
      participantLeaderboard: [],
      lastSeasonWinner: null,
      features: [],
    },
  }).data;

  return (
    <div className="ratings-overview">
      <Leaderboard title="Рейтинг факультетов по мегабаллам" rows={ratings.facultyLeaderboard} />
      <Leaderboard
        title="Рейтинг участников"
        rows={ratings.participantLeaderboard}
        nameKey="nickname"
      />

      {ratings.lastSeasonWinner && (
        <article className="info-card winner-card">
          <p className="card-kicker">{ratings.lastSeasonWinner.title}</p>
          <h2>{ratings.lastSeasonWinner.name}</h2>
          <strong>{ratings.lastSeasonWinner.score} мегабаллов</strong>
          <p>{ratings.lastSeasonWinner.text}</p>
        </article>
      )}
    </div>
  );
}

export function AuthenticatedRatingPanel({ profile, onEditProfile, onPreviewCard, onSignOut }) {
  const ratings = useQuery({
    queryKey: ["ratings"],
    queryFn: Api.getRatings,
    initialData: {
      facultyLeaderboard: [],
      participantLeaderboard: [],
      lastSeasonWinner: null,
      features: [],
    },
  }).data;

  const participantPlace =
    ratings.participantLeaderboard.find((item) => item.nickname === profile?.nickname)?.place ??
    "вне топ-5";
  const avatar = profile?.avatar_url || Api.normalizeURL("/images/people/member.jpg");
  const links = getProfileSocialLinks(profile).slice(0, 4);

  return (
    <div className="authenticated-rating-grid">
      <article className="info-card participant-profile-card">
        <div className="participant-profile-avatar">
          <img src={avatar} alt={profile?.nickname} />
        </div>
        <div className="participant-profile-content">
          <p className="card-kicker">{profile?.faculty || "Megabattle"}</p>
          <h2>{profile?.nickname}</h2>
          {profile?.full_name && <p className="profile-real-name">{profile.full_name}</p>}
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

      <article className="info-card participant-square-card">
        <p className="card-kicker">Твоё место</p>
        <h2>{participantPlace}</h2>
        <div className="participant-square-meta">
          <span>{profile?.megaballs || 0} мегабаллов</span>
          <span>{links.length || 0} соцсети</span>
        </div>
        <p>
          Всё управление профилем, визиткой и NFC-носителями теперь живёт здесь,
          в разделе для участников.
        </p>
      </article>
    </div>
  );
}
