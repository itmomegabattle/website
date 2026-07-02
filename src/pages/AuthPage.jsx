import { useSearchParams } from "react-router-dom";
import AuthPanel from "../components/AuthPanel";
import "../styles/page-info.css";

export default function AuthPage({ mode = "signin" }) {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/ratings";

  return (
    <main className="info-page structured-page auth-page">
      <section className="info-hero main-width">
        <p className="eyebrow">Авторизация</p>
        <h1>{mode === "signup" ? "Новый профиль" : "Вход в профиль"}</h1>
        <p className="info-lead">
          Пока используем номер ИСУ и пароль. Позже этот слой можно заменить на
          ITMO ID без переписывания профилей и NFC-меток.
        </p>
      </section>

      <section className="main-width auth-layout">
        <AuthPanel mode={mode} redirectTo={redirectTo} />
      </section>
    </main>
  );
}
