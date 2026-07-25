import { formatDuration } from "./historyUtils";

export default function HistoryGallery({
  videos,
  activeIndex,
  onSelect,
  onMove,
  onPlay,
}) {
  const feature = videos[activeIndex] || videos[0];

  return (
    <section className="history-gallery" id="gallery">
      <header><h2>ГАЛЕРЕЯ КОНЦЕРТОВ</h2></header>
      <div className="history-gallery__stage">
        {feature && (
          <button type="button" className="history-gallery__feature" onClick={() => onPlay(feature)}>
            <img src={feature.thumbnail} alt="" width="1280" height="720" loading="lazy" />
            <span><b>{feature.title}</b><i>{formatDuration(feature.duration)} · СМОТРЕТЬ ▶</i></span>
          </button>
        )}
        <nav className="history-gallery__controls" aria-label="Управление видеоархивом">
          <span>{String(activeIndex + 1).padStart(2, "0")} / {String(videos.length).padStart(2, "0")}</span>
          <button type="button" onClick={() => onMove(-1)} aria-label="Предыдущее видео">←</button>
          <button type="button" onClick={() => onMove(1)} aria-label="Следующее видео">→</button>
        </nav>
        <div className="history-gallery__rail">
          {videos.map((video, index) => (
            <button
              type="button"
              key={video.id}
              className={`history-gallery__item${index === activeIndex ? " is-active" : ""}`}
              onClick={() => onSelect(index)}
            >
              <img src={video.thumbnail} alt="" width="1280" height="720" loading="lazy" />
              <span><b>{video.title}</b><i>{formatDuration(video.duration)} · PLAY ↗</i></span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
