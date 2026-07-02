import {
  AuthenticatedRatingPanel,
  RatingsOverview,
} from "../components/RatingsSections";
import AuthPanel from "../components/AuthPanel";
import FriendshipGraph from "../components/FriendshipGraph";
import { useAuth } from "../context/AuthContext";
import "../styles/page-info.css";

export default function RatingsPage() {
  const { isAuthenticated, profile } = useAuth();

  return (
    <main className="info-page structured-page participants-page">
      <section className="main-width participants-hero">
        <p className="eyebrow">Megabattle ID</p>
        <h1>Участникам</h1>
      </section>

      <section className="main-width participants-bento">
        {isAuthenticated && profile ? (
          <AuthenticatedRatingPanel profile={profile} />
        ) : (
          <div className="participants-auth-bento">
            <article className="info-card participants-auth-copy">
              <p className="card-kicker">Вход</p>
              <h2>Авторизуйся, чтобы открыть профиль</h2>
              <p>
                После входа здесь появится личное место в рейтинге, визитка,
                соцсети, NFC-метки и связи в графе знакомств.
              </p>
            </article>
            <AuthPanel redirectTo="/ratings" />
          </div>
        )}

        <RatingsOverview />
        <FriendshipGraph />
      </section>

    </main>
  );
}
