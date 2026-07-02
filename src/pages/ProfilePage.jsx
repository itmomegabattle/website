import { Link, Navigate } from "react-router-dom";
import NfcTagsPanel from "../components/NfcTagsPanel";
import ProfileCard from "../components/ProfileCard";
import ProfileEditor from "../components/ProfileEditor";
import { useAuth } from "../context/AuthContext";
import "../styles/page-info.css";

export default function ProfilePage() {
  const { isAuthenticated, isLoading, profile, signOut } = useAuth();

  if (isLoading) {
    return (
      <main className="info-page structured-page">
        <section className="main-width info-card">
          <h1>Загружаем профиль…</h1>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth?redirect=/profile" replace />;
  }

  return (
    <main className="info-page structured-page">
      <section className="info-hero main-width">
        <p className="eyebrow">Личный кабинет</p>
        <h1>Профиль участника</h1>
        <p className="info-lead">
          Публичная визитка, соцсети, описание и будущие NFC-метки живут здесь.
        </p>
      </section>

      <section className="main-width">
        <ProfileCard
          profile={profile}
          actions={
            <>
              <Link className="text-button" to="/ratings">
                В рейтинги
              </Link>
              <button className="text-button" type="button" onClick={signOut}>
                Выйти
              </button>
            </>
          }
        />
      </section>

      <section className="main-width">
        <ProfileEditor />
      </section>

      <section className="main-width">
        <NfcTagsPanel profileId={profile?.id} />
      </section>
    </main>
  );
}
