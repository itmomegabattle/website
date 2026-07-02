import { useSearchParams } from "react-router-dom";
import AuthPanel from "../components/AuthPanel";
import "../styles/page-info.css";

export default function AuthPage({ mode = "signin" }) {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/ratings";

  return (
    <main className="info-page structured-page auth-page">
      <section className="main-width auth-layout">
        <AuthPanel mode={mode} redirectTo={redirectTo} />
      </section>
    </main>
  );
}
