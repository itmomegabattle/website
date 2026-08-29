import { RatingsOverview } from "../components/RatingsSections";
import "../styles/page-info.css";

export default function RatingsPage() {
  return (
    <main className="info-page structured-page participants-page">
      <section className="main-width participants-hero">
        <h1>Рейтинг</h1>
      </section>
      <section className="main-width participants-bento participants-bento--guest">
        <RatingsOverview />
        <article className="info-card profile-services-card">
          <nav className="profile-services-links" aria-label="Ссылки ITMO Megabattle">
            <a href="https://t.me/itmomegabattle" target="_blank" rel="noreferrer"><span>Telegram проекта</span><b>↗</b></a>
            <a href="/events"><span>Афиша мероприятий</span><b>→</b></a>
            <a href="https://mblinks.online" target="_blank" rel="noreferrer"><span>Все площадки</span><b>↗</b></a>
          </nav>
          <div className="profile-services-lock">
            <strong>Статическая версия</strong>
            <span>Без входа и профилей</span>
          </div>
        </article>
      </section>
    </main>
  );
}
