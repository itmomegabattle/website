import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SocialBioCard from "../components/SocialBioCard";
import { useAuth } from "../context/AuthContext";
import {
  addFriendship,
  claimTag,
  getTagByCode,
  logProfileView,
} from "../services/profileService";
import "../styles/page-info.css";

export default function NfcPage() {
  const { tagCode } = useParams();
  const { isAuthenticated, isSupabaseConfigured, profile: ownProfile } = useAuth();
  const [tag, setTag] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const ownerProfile = tag?.profiles ?? null;
  const isOwnTag = ownerProfile?.id && ownerProfile.id === ownProfile?.id;

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getTagByCode(tagCode)
      .then((data) => {
        if (!isMounted) return;
        setTag(data);
        if (data?.profiles) {
          logProfileView({
            viewerProfileId: ownProfile?.id,
            viewedProfileId: data.profiles.id,
            nfcTagId: data.id,
          });
        }
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [tagCode, ownProfile?.id]);

  const handleClaim = async () => {
    setError("");
    setStatus("Привязываем метку…");

    try {
      const nextTag = await claimTag({
        code: tagCode,
        profileId: ownProfile.id,
        label: `Метка ${tagCode}`,
      });
      setTag(nextTag);
      setStatus("Метка привязана к профилю");
    } catch (claimError) {
      setError(claimError.message);
      setStatus("");
    }
  };

  const handleFriendship = async () => {
    setError("");
    setStatus("Добавляем знакомство…");

    try {
      await addFriendship({
        requesterProfileId: ownProfile.id,
        receiverProfileId: ownerProfile.id,
        nfcTagId: tag.id,
      });
      setStatus("Знакомство добавлено в граф");
    } catch (friendshipError) {
      setError(friendshipError.message);
      setStatus("");
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <main className="nfc-page">
        <section className="main-width info-card nfc-message-card">
          <h1>NFC</h1>
          <p>Для NFC-сценариев нужно подключить Supabase в `.env`.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="nfc-page">
      <section className="main-width nfc-page-inner">
        {isLoading ? (
          <article className="info-card nfc-message-card">
            <h2>Считываем метку…</h2>
          </article>
        ) : ownerProfile ? (
          <SocialBioCard
            profile={ownerProfile}
            qrOnSocials={isOwnTag}
            actions={
              isOwnTag ? (
                <Link className="text-button" to="/ratings">
                  Это твоя метка
                </Link>
              ) : isAuthenticated ? (
                <>
                  <button type="button" onClick={handleFriendship}>Добавить знакомство</button>
                </>
              ) : (
                <Link to={`/auth?redirect=/nfc/${tagCode}`}>
                  Войти, чтобы добавить знакомство
                </Link>
              )
            }
          />
        ) : (
          <article className="info-card nfc-message-card nfc-claim-card">
            <p className="card-kicker">Новая метка</p>
            <h2>Эта NFC-метка ещё свободна</h2>
            <p>
              Войди или создай профиль, чтобы привязать эту метку. Потом эта же
              ссылка будет открывать твою публичную визитку.
            </p>
            {isAuthenticated ? (
              <button className="text-button auth-submit" type="button" onClick={handleClaim}>
                Привязать к моему профилю
              </button>
            ) : (
              <div className="profile-actions">
                <Link className="text-button" to={`/auth/register?redirect=/nfc/${tagCode}`}>
                  Создать профиль
                </Link>
                <Link className="text-button" to={`/auth?redirect=/nfc/${tagCode}`}>
                  Войти
                </Link>
              </div>
            )}
          </article>
        )}

        {status && <p className="form-status">{status}</p>}
        {error && <p className="form-error">{error}</p>}
      </section>
    </main>
  );
}
