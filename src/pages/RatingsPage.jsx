import { Link } from "react-router-dom";
import AuthPanel from "../components/AuthPanel";
import FriendshipGraph from "../components/FriendshipGraph";
import NfcTagsPanel from "../components/NfcTagsPanel";
import ProfileCard from "../components/ProfileCard";
import { RatingsOverview } from "../components/RatingsSections";
import { useAuth } from "../context/AuthContext";
import "../styles/page-info.css";

export default function RatingsPage() {
  const { isAuthenticated, profile, signOut } = useAuth();

  return (
    <main className="info-page structured-page participants-page ratings-page">
      <section className="main-width participants-hero">
        <p className="eyebrow">Megabattle ID</p>
        <h1>Участникам</h1>
      </section>

      <section className="main-width participants-public-grid">
        <article className="info-card ratings-intro-card">
          <p className="card-kicker">Сезонный счёт</p>
          <h2>Рейтинг по мегабаллам</h2>
          <p>
            Командный прогресс сезона остаётся открытым для всех. Личный рейтинг
            участников и победитель прошлого сезона скрыты до следующего сезона.
          </p>
        </article>
        <RatingsOverview />
      </section>

      <section className="main-width participants-graph-section">
        <div className="participants-section-head">
          <p className="card-kicker">Граф задач</p>
          <h2>Связи и активность сезона</h2>
        </div>
        <FriendshipGraph />
      </section>

      <section className="main-width participants-account-section">
        {isAuthenticated && profile ? (
          <>
            <ProfileCard
              profile={profile}
              compact
              actions={
                <>
                  <Link className="text-button" to="/profile">
                    Открыть кабинет
                  </Link>
                  <button className="text-button" type="button" onClick={signOut}>
                    Выйти
                  </button>
                </>
              }
            />
            <NfcTagsPanel profileId={profile.id} compact />
          </>
        ) : (
          <div className="participants-auth-bento">
            <article className="info-card participants-auth-copy">
              <p className="card-kicker">Личный кабинет</p>
              <h2>Войди, чтобы открыть профиль</h2>
              <p>
                После входа здесь появится визитка, редактирование профиля,
                соцсети и NFC-метки.
              </p>
            </article>
            <AuthPanel redirectTo="/profile" />
          </div>
        )}
      </section>
    </main>
  );
}
