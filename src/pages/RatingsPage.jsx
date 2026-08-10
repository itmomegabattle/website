import { lazy, Suspense, useEffect, useState } from "react";
import {
  AuthenticatedRatingPanel,
  RatingsOverview,
} from "../components/RatingsSections";
import AuthPanel from "../components/AuthPanel";
import NfcTagsPanel from "../components/NfcTagsPanel";
import ModalPortal from "../components/ModalPortal";
import { useAuth } from "../context/AuthContext";
import { isAdminProfile } from "../services/adminService";
import "../styles/page-info.css";

const AdminCabinetPanel = lazy(() => import("../components/AdminCabinetPanel"));
const ProfileEditor = lazy(() => import("../components/ProfileEditor"));
const SocialBioCard = lazy(() => import("../components/SocialBioCard"));
const RolesDomeSection = lazy(() => import("../components/RolesDomeSection"));

function DeferredRolesSection() {
  return <Suspense fallback={<div className="participants-roles-deferred" aria-hidden="true" />}><RolesDomeSection /></Suspense>;
}

export default function RatingsPage() {
  const { isAuthenticated, profile, signOut } = useAuth();
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
        <h1>Участникам</h1>
      </section>

      {isAuthenticated && canAdmin && (
        <nav className="main-width participants-view-switch" aria-label="Режим страницы">
          <button
            type="button"
            className={activeView === "profile" ? "is-active" : ""}
            aria-pressed={activeView === "profile"}
            onClick={() => setActiveView("profile")}
          >
            Профиль
          </button>
          <button
            type="button"
            className={activeView === "admin" ? "is-active" : ""}
            aria-pressed={activeView === "admin"}
            onClick={() => {
              closeModal();
              setActiveView("admin");
            }}
          >
            Админка
          </button>
        </nav>
      )}

      {activeView === "profile" ? (
        <>
          <section className="main-width participants-bento">
            {isAuthenticated && profile ? (
              <>
                <AuthenticatedRatingPanel
                  profile={profile}
                  onEditProfile={() => setActiveModal("edit")}
                  onPreviewCard={() => setActiveModal("preview")}
                  onSignOut={signOut}
                />
                <NfcTagsPanel profileId={profile.id} compact />
              </>
            ) : (
              <div className="participants-auth-bento">
                <article className="info-card participants-auth-copy">
                  <h2>Авторизуйся, чтобы открыть профиль</h2>
                  <p>
                    После входа здесь появятся визитка, личный прогресс,
                    соцсети, NFC-метки и связи в графе знакомств.
                  </p>
                </article>
                <AuthPanel redirectTo="/ratings" />
              </div>
            )}

            <RatingsOverview />
          </section>

          <DeferredRolesSection />
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
              aria-label={activeModal === "edit" ? "Редактирование профиля" : "Предпросмотр визитки"}
            >
              <button className="profile-modal-close" type="button" onClick={closeModal}>
                ×
              </button>
              {activeModal === "edit" ? (
                <Suspense fallback={null}><ProfileEditor /></Suspense>
              ) : (
                <Suspense fallback={null}><SocialBioCard profile={profile} qrOnSocials /></Suspense>
              )}
            </section>
          </div>
        </ModalPortal>
      )}
    </main>
  );
}
