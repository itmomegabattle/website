import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthPanel({ redirectTo = "/ratings" }) {
  const navigate = useNavigate();
  const container = useRef(null);
  const { signInTelegram } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const callbackName = `onTelegramAuth_${Math.random().toString(36).slice(2)}`;
    window[callbackName] = async (user) => {
      try { await signInTelegram(user); navigate(redirectTo); }
      catch (authError) { setError(authError.message); }
    };
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.dataset.telegramLogin = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || "IMB_gamebot";
    script.dataset.size = "large";
    script.dataset.radius = "12";
    script.dataset.userpic = "false";
    script.dataset.requestAccess = "write";
    script.dataset.onauth = `${callbackName}(user)`;
    container.current?.appendChild(script);
    return () => { delete window[callbackName]; script.remove(); };
  }, [navigate, redirectTo, signInTelegram]);

  return (
    <div className="info-card auth-card">
      <p className="card-kicker">Telegram</p>
      <h2>Войти в экосистему</h2>
      <p>Один аккаунт для сайта, NFC-визитки и бота. После входа заполни имя или никнейм и выбери факультет.</p>
      <div ref={container} className="telegram-login-widget" />
      {error && <p className="form-error">{error}</p>}
      <p className="auth-switch">ITMO.ID появится здесь после получения доступа от университета.</p>
    </div>
  );
}
