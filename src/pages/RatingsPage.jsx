import {
  AuthenticatedRatingPanel,
  RatingsOverview,
} from "../components/RatingsSections";
import FriendshipGraph from "../components/FriendshipGraph";
import { useAuth } from "../context/AuthContext";
import "../styles/page-info.css";

export default function RatingsPage() {
  const { isAuthenticated, profile } = useAuth();

  return (
    <main className="info-page structured-page">
      <section className="main-width">
        <h1>Рейтинги</h1>
        <RatingsOverview />
      </section>

      {isAuthenticated && profile && (
        <section className="main-width">
          <AuthenticatedRatingPanel profile={profile} />
        </section>
      )}

      <section className="main-width">
        <FriendshipGraph />
      </section>
    </main>
  );
}
