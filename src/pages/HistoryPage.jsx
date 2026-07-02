import { ArchiveCards, ProjectTimeline } from "../components/HistorySections";
import "../styles/page-info.css";

export default function HistoryPage() {
  return (
    <main className="info-page structured-page">
      <section className="info-hero main-width">
        <p className="eyebrow">История проекта</p>
        <h1>Лор Megabattle для самых любознательных</h1>
        <p className="info-lead">
          Как проект вырос из университетских традиций, зачем нужен архив и где
          скоро будут жить записи старых концертов.
        </p>
      </section>

      <section className="main-width">
        <h1>Таймлайн</h1>
        <ProjectTimeline />
      </section>

      <section className="main-width">
        <h1>Архив выступлений</h1>
        <ArchiveCards />
      </section>

      <section className="main-width video-placeholder" aria-label="Будущий видеоплеер">
        <span>&gt;</span>
        <div>
          <p>тут ролик</p>
        </div>
        <span>&gt;</span>
      </section>
    </main>
  );
}
