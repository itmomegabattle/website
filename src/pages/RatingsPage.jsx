import { useEffect, useState } from "react";
import {
  AuthenticatedRatingPanel,
  RatingsOverview,
} from "../components/RatingsSections";
import AdminCabinetPanel from "../components/AdminCabinetPanel";
import AuthPanel from "../components/AuthPanel";
import NfcTagsPanel from "../components/NfcTagsPanel";
import ProfileEditor from "../components/ProfileEditor";
import SocialBioCard from "../components/SocialBioCard";
import ModalPortal from "../components/ModalPortal";
import { useAuth } from "../context/AuthContext";
import { isAdminProfile } from "../services/adminService";
import "../styles/page-info.css";

export default function RatingsPage() {
  const { isAuthenticated, profile, signOut } = useAuth();
  const canAdmin = isAdminProfile(profile);
  const [activeModal, setActiveModal] = useState(null);
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
        <p className="eyebrow">Megabattle ID</p>
        <h1>Участникам</h1>
      </section>

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
      </section>

      {isAuthenticated && canAdmin && <AdminCabinetPanel />}

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
                <ProfileEditor />
              ) : (
                <SocialBioCard profile={profile} qrOnSocials />
              )}
            </section>
          </div>
        </ModalPortal>
      )}
    </main>
  );
}
