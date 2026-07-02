import {
  AuthenticatedRatingPanel,
  FunFeatures,
  GuestRatingPanel,
  RatingsOverview,
} from "../components/RatingsSections";
import { useAuth } from "../context/AuthContext";
import "../styles/page-info.css";

export default function RatingsPage() {
  const { isAuthenticated, profile } = useAuth();

  return (
    <main className="info-page structured-page">
      <section className="info-hero main-width">
        <p className="eyebrow">Рейтинги + приколы</p>
        <h1>Рейтинг, бот, граф знакомств и профиль</h1>
        <p className="info-lead">
          Игровой слой сайта: баллы среди участников и факультетов, внутренние
          отметки, бот с обоями и будущая страница профиля.
        </p>
      </section>

      <section className="main-width">
        <h1>Рейтинги</h1>
        <RatingsOverview />
      </section>

      <section className="main-width">
        <h1>Личный профиль</h1>
        {isAuthenticated && profile ? (
          <AuthenticatedRatingPanel profile={profile} />
        ) : (
          <GuestRatingPanel />
        )}
      </section>

      <section className="main-width">
        <h1>Приколы и профиль</h1>
        <FunFeatures />
      </section>
    </main>
  );
}
