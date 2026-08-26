import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AuthenticatedRatingPanel,
  RatingsOverview,
} from "../components/RatingsSections";
import AuthPanel from "../components/AuthPanel";
import NfcTagsPanel from "../components/NfcTagsPanel";
import Modal from "../common/components/Modal";
import Toggle from "../common/components/Toggle";
import { useAuth } from "../context/AuthContext";
import { isAdminProfile } from "../services/adminService";
import { getProfileTags } from "../services/profileService";
import "../common/components/toggle.css";
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
  const profileTagsQuery = useQuery({
    queryKey: ["profile-tags", profile?.id],
    queryFn: getProfileTags,
    enabled: Boolean(isAuthenticated && profile?.id && !isDevMock),
    placeholderData: [],
  });
  const publicProfileTags = (profileTagsQuery.data ?? []).filter((tag) => tag.is_active !== false && tag.public_slug);
  const closeModal = () => setActiveModal(null);

  const openBusinessCard = async () => {
    const loadedTags = publicProfileTags.length
      ? publicProfileTags
      : (await getProfileTags()).filter((tag) => tag.is_active !== false && tag.public_slug);
    if (loadedTags.length > 0) {
      navigate(`/nfc/${loadedTags[0].public_slug}`);
      return;
    }
    setActiveModal("cards");
  };

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
          <Toggle
            label="Режим страницы"
            wrapClassName="profile-view-filters"
            className="profile-view-toggle"
            options={[
              { value: "profile", label: "Профиль" },
              { value: "admin", label: "Админка" },
            ]}
            value={activeView}
            onChange={(view) => {
              if (view === "admin") closeModal();
              setActiveView(view);
            }}
          />
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
                  onPreviewCard={openBusinessCard}
                  onSignOut={signOut}
                />
                <NfcTagsPanel profileId={profile.id} compact />
              </>
            ) : (
              <div className="participants-auth-bento">
                <article className="info-card participants-auth-copy">
                  <h2>Профиль начинается со входа</h2>
                </article>
                <AuthPanel redirectTo="/ratings" showPolicyNotice />
              </div>
            )}

            <RatingsOverview />
            {!isAuthenticated && (
              <article className="info-card profile-services-card">
                <nav className="profile-services-links" aria-label="Сервисы ITMO Megabattle">
                  <a href="https://t.me/itmomegabattle" target="_blank" rel="noreferrer"><span>Telegram проекта</span><b>↗</b></a>
                  <a href="/nfc"><span>NFC-визитка</span><b>→</b></a>
                  <a href="/events"><span>Афиша мероприятий</span><b>→</b></a>
                  <a href="https://mblinks.online" target="_blank" rel="noreferrer"><span>Все площадки</span><b>↗</b></a>
                </nav>
                <div className="profile-services-lock" aria-label="Сервисы появятся позже">
                  <strong>Сервисы</strong>
                  <span>Скоро</span>
                </div>
              </article>
            )}
          </section>
        </>
      ) : (
        isAuthenticated && canAdmin && <Suspense fallback={null}><AdminCabinetPanel /></Suspense>
      )}

      {activeModal && (
        <Modal
          label={activeModal === "cards" ? "Выбор NFC-визитки" : "Редактирование профиля"}
          onClose={closeModal}
          className={`profile-modal profile-modal--${activeModal}`}
        >
          {activeModal === "cards" ? (
            <div className="profile-card-picker">
              <p className="card-kicker">NFC-визитка</p>
              <h2>Нет привязанных меток</h2>
              <p>Сначала привяжи NFC-метку к профилю — после этого кнопка будет открывать настоящую визитку.</p>
            </div>
          ) : (
            <Suspense fallback={null}><ProfileEditor /></Suspense>
          )}
        </Modal>
      )}
    </main>
  );
}
