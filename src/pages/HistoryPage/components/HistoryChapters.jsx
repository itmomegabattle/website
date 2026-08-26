import HistorySeasonCard from "./HistorySeasonCard";
import "./history-chapters.css";

export default function HistoryChapters({ seasons, onOpen }) {
  return (
    <section className="history-chapters" id="seasons">
      <header className="history-chapters__header">
        <h2>ГЛАВЫ<br />ИСТОРИИ</h2>
      </header>
      <div className="history-chapters__grid">
        {seasons.map((season, index) => (
          <HistorySeasonCard
            key={season.number}
            season={season}
            index={index}
            onOpen={onOpen}
          />
        ))}
      </div>
    </section>
  );
}
