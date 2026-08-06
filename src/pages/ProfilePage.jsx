import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AdminCabinetPanel from "../components/AdminCabinetPanel";
import AuthPanel from "../components/AuthPanel";
import NfcTagsPanel from "../components/NfcTagsPanel";
import ProfileCard from "../components/ProfileCard";
import ProfileEditor from "../components/ProfileEditor";
import { RatingsOverview } from "../components/RatingsSections";
import SocialBioCard from "../components/SocialBioCard";
import { useAuth } from "../context/AuthContext";
import { isAdminProfile } from "../services/adminService";
import "../styles/page-info.css";

function CabinetSwitch({ activeTab, setActiveTab, canAdmin }) {
  return (
    <div className="cabinet-switch-wrap">
      <div className="cabinet-switch" data-tab={activeTab}>
        <div className="cabinet-switch-slider" />
        <button
          className={`cabinet-switch-btn${activeTab === "cabinet" ? " active" : ""}`}
          type="button"
          onClick={() => setActiveTab("cabinet")}
        >
          Кабинет
        </button>
        <button
          className={`cabinet-switch-btn${activeTab === "admin" ? " active" : ""}`}
          type="button"
          onClick={() => canAdmin && setActiveTab("admin")}
          disabled={!canAdmin}
          title={canAdmin ? "Админка" : "Доступно администраторам"}
        >
          Админка
        </button>
      </div>
    </div>
  );
}

function AuthRequired() {
  return (
    <section className="main-width participants-auth-bento">
      <article className="info-card participants-auth-copy">
        <p className="card-kicker">Личный кабинет</p>
        <h2>Войди, чтобы открыть профиль</h2>
        <p>
          Здесь будет твоя визитка, публичный профиль, редактирование данных,
          NFC-метки и рейтинг факультетов по мегабаллам.
        </p>
      </article>
      <AuthPanel redirectTo="/profile" />
    </section>
  );
}

function CabinetView({ profile, signOut }) {
  return (
    <>
      <section className="main-width cabinet-grid">
        <div className="cabinet-profile-stack">
          <ProfileCard
            profile={profile}
            actions={
              <>
                <a className="text-button" href={`/u/${profile.id}`} target="_blank" rel="noreferrer">
                  Открыть публично
                </a>
                <button className="text-button" type="button" onClick={signOut}>
                  Выйти
                </button>
              </>
            }
          />
          <NfcTagsPanel profileId={profile.id} compact />
        </div>

        <article className="info-card cabinet-bio-preview">
          <div className="cabinet-card-head">
            <p className="card-kicker">Визитка</p>
            <h2>Так тебя увидят по NFC</h2>
          </div>
          <SocialBioCard profile={profile} qrOnSocials />
        </article>
      </section>

      <section className="main-width cabinet-edit-grid">
        <ProfileEditor />
        <RatingsOverview />
      </section>
    </>
  );
}

export default function ProfilePage() {
  const location = useLocation();
  const { isAuthenticated, profile, signOut } = useAuth();
  const canAdmin = isAdminProfile(profile);
  const [activeTab, setActiveTab] = useState(location.pathname === "/admin" ? "admin" : "cabinet");

  useEffect(() => {
    if (location.pathname === "/admin") {
      setActiveTab("admin");
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!canAdmin && activeTab === "admin") {
      setActiveTab("cabinet");
    }
  }, [activeTab, canAdmin]);

  return (
    <main className="info-page structured-page participants-page cabinet-page">
      <section className="main-width participants-hero cabinet-hero">
        <p className="eyebrow">Megabattle ID</p>
        <h1>Профиль</h1>
        {isAuthenticated && (
          <CabinetSwitch activeTab={activeTab} setActiveTab={setActiveTab} canAdmin={canAdmin} />
        )}
      </section>

      {!isAuthenticated || !profile ? (
        <AuthRequired />
      ) : activeTab === "admin" ? (
        canAdmin ? (
          <AdminCabinetPanel />
        ) : (
          <section className="main-width">
            <article className="info-card">
              <p className="card-kicker">Админка</p>
              <h2>Нет доступа</h2>
              <p>Этот раздел виден только администраторам проекта.</p>
            </article>
          </section>
        )
      ) : (
        <CabinetView profile={profile} signOut={signOut} />
      )}
    </main>
  );
}
