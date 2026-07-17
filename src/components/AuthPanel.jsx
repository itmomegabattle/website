import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PENDING_LOGIN_KEY = "mb_telegram_web_login";

function returnAttempt() {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const startToken = hash.get("telegram_attempt");
  const browserSecret = hash.get("telegram_secret");
  if (startToken && browserSecret) {
    const attempt = {
      startToken,
      browserSecret,
      expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
    };
    sessionStorage.setItem(PENDING_LOGIN_KEY, JSON.stringify(attempt));
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    return attempt;
  }
  try {
    const stored = JSON.parse(sessionStorage.getItem(PENDING_LOGIN_KEY) || "null");
    if (stored?.startToken && stored?.browserSecret && new Date(stored.expiresAt).getTime() > Date.now()) return stored;
  } catch {
    sessionStorage.removeItem(PENDING_LOGIN_KEY);
  }
  return null;
}

export default function AuthPanel({ redirectTo = "/ratings" }) {
  const navigate = useNavigate();
  const { beginTelegramWebLogin, completeTelegramWebLogin } = useAuth();
  const [attempt, setAttempt] = useState(returnAttempt);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!attempt) return undefined;
    let cancelled = false;
    let timer;

    const poll = async () => {
      if (new Date(attempt.expiresAt).getTime() <= Date.now()) {
        sessionStorage.removeItem(PENDING_LOGIN_KEY);
        if (!cancelled) {
          setAttempt(null);
          setError("Время подтверждения истекло. Создай новую ссылку входа.");
        }
        return;
      }
      try {
        const profile = await completeTelegramWebLogin(attempt.startToken, attempt.browserSecret);
        if (cancelled) return;
        if (profile) {
          sessionStorage.removeItem(PENDING_LOGIN_KEY);
          navigate(redirectTo, { replace: true });
          return;
        }
        timer = window.setTimeout(poll, 1800);
      } catch (authError) {
        if (cancelled) return;
        sessionStorage.removeItem(PENDING_LOGIN_KEY);
        setAttempt(null);
        setError(authError.message);
      }
    };

    poll();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [attempt, completeTelegramWebLogin, navigate, redirectTo]);

  const startLogin = async () => {
    setError("");
    setIsStarting(true);
    try {
      const nextAttempt = await beginTelegramWebLogin();
      const stored = {
        startToken: nextAttempt.startToken,
        browserSecret: nextAttempt.browserSecret,
        expiresAt: nextAttempt.expiresAt,
      };
      sessionStorage.setItem(PENDING_LOGIN_KEY, JSON.stringify(stored));
      setAttempt(stored);
      // Use the current tab: asynchronous popups are blocked by mobile Safari
      // and some Telegram in-app browsers. A direct navigation reliably opens
      // the native Telegram app and the bot brings the user back afterwards.
      window.location.assign(nextAttempt.botUrl);
    } catch (authError) {
      setError(authError.message);
    } finally {
      setIsStarting(false);
    }
  };

  const cancelLogin = () => {
    sessionStorage.removeItem(PENDING_LOGIN_KEY);
    setAttempt(null);
    setIsStarting(false);
    setError("");
  };

  return (
    <div className="info-card auth-card">
      <p className="card-kicker">Telegram</p>
      <h2>Войти в экосистему</h2>
      <p>Один аккаунт для сайта, NFC-визитки и бота. Подтверди вход в приложении Telegram — открытая страница авторизуется автоматически.</p>
      <button className="text-button auth-telegram-button" type="button" onClick={startLogin} disabled={isStarting || Boolean(attempt)}>
        {isStarting ? "Создаём ссылку…" : attempt ? "Ожидаем подтверждение…" : "Открыть Telegram"}
      </button>
      {attempt && (
        <div className="auth-pending-actions">
          <p className="form-status">Нажми «Подтвердить вход» в боте и вернись на сайт.</p>
          <button className="auth-cancel-button" type="button" onClick={cancelLogin}>Отменить вход</button>
        </div>
      )}
      {error && <p className="form-error">{error}</p>}
      <p className="auth-switch">ITMO.ID появится здесь после получения доступа от университета.</p>
    </div>
  );
}
