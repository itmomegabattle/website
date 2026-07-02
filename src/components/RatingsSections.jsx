import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Api } from "../api";
import ProfileCard from "./ProfileCard";

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

export function AuthenticatedRatingPanel({ profile }) {
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

  return (
    <div className="authenticated-rating-grid">
      <article className="info-card participant-place-card">
        <p className="card-kicker">Твоё место</p>
        <h2>{participantPlace}</h2>
        <p>
          Пока рейтинг участников берётся из JSON. Когда подключим админку,
          баллы можно будет менять без релиза сайта.
        </p>
      </article>

      <ProfileCard
        profile={profile}
        compact
        actions={
          <>
            <Link className="text-button" to="/profile">
              Открыть кабинет
            </Link>
            <Link className="text-button" to={`/u/${profile?.id}`}>
              Моя визитка
            </Link>
          </>
        }
      />
    </div>
  );
}

export function GuestRatingPanel() {
  return (
    <article className="info-card auth-teaser-card">
      <p className="card-kicker">Личный кабинет</p>
      <h2>Войди, чтобы увидеть свой профиль</h2>
      <p>
        После входа появятся место в топе участников, публичная визитка,
        соцсети и NFC-метки.
      </p>
      <div className="profile-actions">
        <Link className="text-button" to="/auth">
          Войти
        </Link>
        <Link className="text-button" to="/auth/register">
          Создать профиль
        </Link>
      </div>
    </article>
  );
}

export function FunFeatures() {
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
    <div className="feature-grid">
      {ratings.features.map((feature) => (
        <article className="info-card" key={feature.title}>
          <h2>{feature.title}</h2>
          <p>{feature.text}</p>
        </article>
      ))}
    </div>
  );
}
