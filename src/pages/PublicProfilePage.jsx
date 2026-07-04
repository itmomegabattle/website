import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SocialBioCard from "../components/SocialBioCard";
import { useAuth } from "../context/AuthContext";
import { isAdminProfile } from "../services/adminService";
import { addFriendship, getProfileById, logProfileView } from "../services/profileService";
import "../styles/page-info.css";

export default function PublicProfilePage() {
  const { profileId } = useParams();
  const { isAuthenticated, profile: ownProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    getProfileById(profileId)
      .then((data) => {
        if (!isMounted) return;
        setProfile(data);
        if (data) {
          logProfileView({
            viewerProfileId: ownProfile?.id,
            viewedProfileId: data.id,
          });
        }
      })
      .catch((loadError) => setError(loadError.message));

    return () => {
      isMounted = false;
    };
  }, [profileId, ownProfile?.id]);

  const handleFriendship = async () => {
    setError("");
    setStatus("Добавляем знакомство…");

    try {
      await addFriendship({
        requesterProfileId: ownProfile.id,
        receiverProfileId: profile.id,
      });
      setStatus("Знакомство добавлено в граф");
    } catch (friendshipError) {
      setError(friendshipError.message);
      setStatus("");
    }
  };

  const actions = isAuthenticated && ownProfile?.id !== profile?.id ? (
    <button className="text-button" type="button" onClick={handleFriendship}>
      Добавить знакомство
    </button>
  ) : !isAuthenticated ? (
    <Link className="text-button" to={`/auth?redirect=/u/${profileId}`}>
      Войти, чтобы добавить знакомство
    </Link>
  ) : null;
  const isBannedForViewer = profile?.is_banned && !isAdminProfile(ownProfile);

  return (
    <main className="info-page structured-page">
      <section className="info-hero main-width">
        <p className="eyebrow">Визитка</p>
        <h1>{profile?.nickname ?? "Профиль участника"}</h1>
      </section>

      <section className="main-width">
        {isBannedForViewer ? (
          <article className="info-card">
            <h2>Профиль заблокирован</h2>
            <p>Админ временно выключил публичную визитку этого участника.</p>
          </article>
        ) : profile ? (
          <SocialBioCard
            profile={profile}
            actions={actions}
            qrOnSocials={ownProfile?.id === profile.id}
          />
        ) : (
          <article className="info-card">
            <h2>Профиль не найден</h2>
            <p>Возможно, визитку ещё не создали или ссылка неверная.</p>
          </article>
        )}
        {status && <p className="form-status">{status}</p>}
        {error && <p className="form-error">{error}</p>}
      </section>
    </main>
  );
}
