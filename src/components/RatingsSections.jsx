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
