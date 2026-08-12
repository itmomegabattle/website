import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AuthenticatedRatingPanel,
  RatingsOverview,
} from "../components/RatingsSections";
import AuthPanel from "../components/AuthPanel";
import NfcTagsPanel from "../components/NfcTagsPanel";
import ModalPortal from "../components/ModalPortal";
import { useAuth } from "../context/AuthContext";
import { isAdminProfile } from "../services/adminService";
import "../styles/member-list.css";
import "../styles/page-info.css";

const AdminCabinetPanel = lazy(() => import("../components/AdminCabinetPanel"));
const ProfileEditor = lazy(() => import("../components/ProfileEditor"));

export default function RatingsPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  const DEV_PROFILE = {
    id: 999999,
    nickname: "Никита",
    full_name: "nikita",
    bio: "Делаю всякое красивое и иногда ломаю прод.",
    avatar_url: null,

    faculty: "Megabattle",
    megaballs: 1240,

    role_badge: "Участник",
    is_admin: false,
    is_best_actor: false,

    // тут структура должна совпадать с тем,
    // что ожидает getProfileSocialLinks()
    social_links: [
      {
        type: "telegram",
        title: "Telegram",
        url: "https://t.me/nikita",
      },
    ],

    // специальный флаг для локального мока
    __devMock: true,
  };

  const isDevMock = import.meta.env.DEV;

  const isAuthenticated = isDevMock ? true : auth.isAuthenticated;
  const profile = isDevMock ? DEV_PROFILE : auth.profile;
  const signOut = isDevMock
    ? () => console.log("DEV: signOut")
    : auth.signOut;
  const canAdmin = isAdminProfile(profile);
  const [activeModal, setActiveModal] = useState(null);
  const [activeView, setActiveView] = useState("profile");
  const closeModal = () => setActiveModal(null);

  useEffect(() => {
    if (!activeModal) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModal]);

  return (
    <main className="info-page structured-page participants-page">
      <section className="main-width participants-hero">
        <h1>Профиль</h1>
        {isAuthenticated && canAdmin && (
          <nav className="team-filters profile-view-filters" aria-label="Режим страницы">
            <div className="team-toggle profile-view-toggle" data-filter={activeView}>
              <span className="toggle-slider" aria-hidden="true" />
              <button
                type="button"
                className={`toggle-btn${activeView === "profile" ? " active" : ""}`}
                aria-pressed={activeView === "profile"}
                onClick={() => setActiveView("profile")}
              >
                Профиль
              </button>
              <button
                type="button"
                className={`toggle-btn${activeView === "admin" ? " active" : ""}`}
                aria-pressed={activeView === "admin"}
                onClick={() => {
                  closeModal();
                  setActiveView("admin");
                }}
              >
                Админка
              </button>
            </div>
          </nav>
        )}
      </section>

      {activeView === "profile" ? (
        <>
          <section className={`main-width participants-bento${isAuthenticated ? "" : " participants-bento--guest"}`}>
            {isAuthenticated && profile ? (
              <>
                <AuthenticatedRatingPanel
                  profile={profile}
                  onEditProfile={() => setActiveModal("edit")}
                  onPreviewCard={() => navigate(`/u/${profile.id}`)}
                  onSignOut={signOut}
                />
                <NfcTagsPanel profileId={profile.id} compact />
              </>
            ) : (
              <div className="participants-auth-bento">
                <article className="info-card participants-auth-copy">
                  <h2>Профиль начинается со входа</h2>
                  <p>
                    Визитка, личный прогресс, соцсети, NFC-метки и связи
                    в графе знакомств собраны в одном кабинете.
                  </p>
                </article>
                <AuthPanel redirectTo="/ratings" showPolicyNotice />
              </div>
            )}

            <RatingsOverview />
          </section>
        </>
      ) : (
        isAuthenticated && canAdmin && <Suspense fallback={null}><AdminCabinetPanel /></Suspense>
      )}

      {activeModal && (
        <ModalPortal>
          <div className="profile-modal-backdrop" role="presentation" onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}>
            <section
              className={`profile-modal profile-modal--${activeModal}`}
              role="dialog"
              aria-modal="true"
              aria-label="Редактирование профиля"
            >
              <button className="profile-modal-close" type="button" onClick={closeModal}>
                ×
              </button>
              <Suspense fallback={null}><ProfileEditor /></Suspense>
            </section>
          </div>
        </ModalPortal>
      )}
    </main>
  );
}
