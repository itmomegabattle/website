import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PENDING_LOGIN_KEY = "mb_telegram_oidc_login";
const LEGACY_PENDING_LOGIN_KEY = "mb_telegram_web_login";

function base64Url(bytes) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createPkce() {
  const verifier = base64Url(crypto.getRandomValues(new Uint8Array(32)));
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return { verifier, challenge: base64Url(new Uint8Array(digest)) };
}

function returnAttempt() {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const code = hash.get("telegram_code");
  const state = hash.get("telegram_state");
  const callbackError = hash.get("telegram_error");
  let stored = null;
  try { stored = JSON.parse(sessionStorage.getItem(PENDING_LOGIN_KEY) || "null"); }
  catch { sessionStorage.removeItem(PENDING_LOGIN_KEY); }

  if (code || state || callbackError) {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    if (callbackError) {
      sessionStorage.removeItem(PENDING_LOGIN_KEY);
      return { callbackError: `Telegram не подтвердил вход: ${callbackError}` };
    }
    if (!stored?.state || stored.state !== state || !stored.codeVerifier || !stored.nonce) {
      return { callbackError: "Подтверждение открыто не в том браузере. Начни вход заново в исходной вкладке." };
    }
    if (new Date(stored.expiresAt).getTime() <= Date.now()) {
      sessionStorage.removeItem(PENDING_LOGIN_KEY);
      return { callbackError: "Время подтверждения истекло. Начни вход заново." };
    }
    return { ...stored, code };
  }
  if (stored?.state && stored?.codeVerifier && stored?.nonce && new Date(stored.expiresAt).getTime() > Date.now()) return stored;
  sessionStorage.removeItem(PENDING_LOGIN_KEY);
  return null;
}

export default function AuthPanel({ redirectTo = "/ratings", showPolicyNotice = false }) {
  const navigate = useNavigate();
  const { beginTelegramOidcLogin, completeTelegramOidcLogin } = useAuth();
  const [initialAttempt] = useState(returnAttempt);
  const [attempt, setAttempt] = useState(initialAttempt?.callbackError ? null : initialAttempt);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState(initialAttempt?.callbackError ?? "");
  const completionStarted = useRef(false);

  useEffect(() => {
    if (!attempt?.code || completionStarted.current) return undefined;
    completionStarted.current = true;
    let cancelled = false;

    const complete = async () => {
      try {
        const profile = await completeTelegramOidcLogin(attempt.code, attempt.state, attempt.codeVerifier, attempt.nonce);
        if (cancelled) return;
        if (profile) {
          sessionStorage.removeItem(PENDING_LOGIN_KEY);
          navigate(redirectTo, { replace: true });
        }
      } catch (authError) {
        if (cancelled) return;
        sessionStorage.removeItem(PENDING_LOGIN_KEY);
        setAttempt(null);
        setError(authError.message);
      }
    };

    complete();
    return () => {
      cancelled = true;
    };
  }, [attempt, completeTelegramOidcLogin, navigate, redirectTo]);

  const startLogin = async () => {
    setError("");
    setIsStarting(true);
    sessionStorage.removeItem(LEGACY_PENDING_LOGIN_KEY);
    try {
      const pkce = await createPkce();
      const nextAttempt = await beginTelegramOidcLogin(pkce.challenge, `${window.location.origin}/ratings`);
      const stored = {
        state: nextAttempt.state,
        nonce: nextAttempt.nonce,
        codeVerifier: pkce.verifier,
        expiresAt: nextAttempt.expiresAt,
      };
      sessionStorage.setItem(PENDING_LOGIN_KEY, JSON.stringify(stored));
      setAttempt(stored);
      window.location.assign(nextAttempt.authorizationUrl);
    } catch (authError) {
      setError(authError.message);
    } finally {
      setIsStarting(false);
    }
  };

  const cancelLogin = () => {
    sessionStorage.removeItem(PENDING_LOGIN_KEY);
    sessionStorage.removeItem(LEGACY_PENDING_LOGIN_KEY);
    setAttempt(null);
    setIsStarting(false);
    setError("");
  };

  return (
    <div className="info-card auth-card">
      <p className="card-kicker">Telegram</p>
      <h2>Войти в экосистему</h2>
      <p className="auth-description">Один аккаунт для сайта, NFC-визитки и бота. Telegram откроет приложение и попросит подтвердить вход для этого браузера.</p>
      <button className="text-button auth-telegram-button" type="button" onClick={startLogin} disabled={isStarting || Boolean(attempt)}>
        <span>{isStarting ? "Подключаем Telegram…" : attempt?.code ? "Завершаем вход…" : attempt ? "Ожидаем Telegram…" : "Войти через Telegram"}</span>
        {!isStarting && !attempt && <span aria-hidden="true">→</span>}
      </button>
      {showPolicyNotice && (
        <p className="auth-policy-notice">
          Продолжая вход, вы подтверждаете, что ознакомились с нашей{" "}
          <a href="/itmo-megabattle-privacy-policy.pdf" target="_blank" rel="noreferrer">политикой конфиденциальности</a>.
        </p>
      )}
      {attempt && (
        <div className="auth-pending-actions">
          <p className="form-status">Подтверди вход в приложении Telegram. Не пересылай адрес авторизации.</p>
          <button className="auth-cancel-button" type="button" onClick={cancelLogin}>Отменить вход</button>
        </div>
      )}
      {error && <p className="form-error">{error}</p>}
      <p className="auth-switch">ITMO.ID появится здесь после получения доступа от университета.</p>
    </div>
  );
}
