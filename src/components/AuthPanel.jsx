import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const faculties = ["КТУ", "ТИНТ", "НОЖ", "ФТМФ", "ФТМИ"];

function getAuthErrorMessage(message) {
  const normalized = message.toLowerCase();

  if (normalized.includes("email rate limit")) {
    return "Supabase упёрся в лимит отправки писем. Для нашего MVP нужно выключить подтверждение email в Supabase: Authentication → Providers → Email → Confirm email = off. После этого попробуй снова чуть позже.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "Неверный номер ИСУ или пароль.";
  }

  if (normalized.includes("already registered") || normalized.includes("user already registered")) {
    return "Профиль с таким номером ИСУ уже зарегистрирован. Попробуй войти.";
  }

  return message;
}

export default function AuthPanel({ mode = "signin", redirectTo = "/ratings" }) {
  const navigate = useNavigate();
  const { isSupabaseConfigured, signIn, signUp } = useAuth();
  const [form, setForm] = useState({
    isuNumber: "",
    password: "",
    nickname: "",
    fullName: "",
    faculty: faculties[0],
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSignUp = mode === "signup";

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError("");
    setStatus("Проверяем данные…");

    try {
      if (isSignUp) {
        await signUp(form);
      } else {
        await signIn(form);
      }
      navigate(redirectTo);
    } catch (submitError) {
      setError(getAuthErrorMessage(submitError.message));
      setStatus("");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="info-card auth-card">
        <p className="card-kicker">Supabase</p>
        <h2>Нужно подключить проект</h2>
        <p>
          Создай `.env` по примеру `.env.example`, добавь `VITE_SUPABASE_URL` и
          `VITE_SUPABASE_ANON_KEY`, затем перезапусти dev-сервер.
        </p>
      </div>
    );
  }

  return (
    <form className="info-card auth-card" onSubmit={handleSubmit}>
      <p className="card-kicker">{isSignUp ? "Регистрация" : "Вход"}</p>
      <h2>{isSignUp ? "Создать профиль" : "Войти по ИСУ"}</h2>

      <label className="form-field">
        <span>Номер ИСУ</span>
        <input
          name="isuNumber"
          inputMode="numeric"
          autoComplete="username"
          value={form.isuNumber}
          onChange={updateField}
          required
        />
      </label>

      <label className="form-field">
        <span>Пароль</span>
        <input
          name="password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          value={form.password}
          minLength={6}
          onChange={updateField}
          required
        />
      </label>

      {isSignUp && (
        <>
          <label className="form-field">
            <span>Никнейм</span>
            <input
              name="nickname"
              value={form.nickname}
              onChange={updateField}
              required
            />
          </label>

          <label className="form-field">
            <span>Имя</span>
            <input name="fullName" value={form.fullName} onChange={updateField} />
          </label>

          <label className="form-field">
            <span>Факультет</span>
            <select name="faculty" value={form.faculty} onChange={updateField}>
              {faculties.map((faculty) => (
                <option value={faculty} key={faculty}>
                  {faculty}
                </option>
              ))}
            </select>
          </label>
        </>
      )}

      {error && <p className="form-error">{error}</p>}
      {status && <p className="form-status">{status}</p>}

      <button className="text-button auth-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Подождите…" : isSignUp ? "Зарегистрироваться" : "Войти"}
      </button>

      <p className="auth-switch">
        {isSignUp ? "Уже есть профиль?" : "Нет профиля?"}{" "}
        <Link to={isSignUp ? "/auth" : "/auth/register"}>
          {isSignUp ? "Войти" : "Создать"}
        </Link>
      </p>
    </form>
  );
}
