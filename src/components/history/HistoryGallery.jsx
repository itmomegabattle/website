import { formatDuration } from "./historyUtils";

export default function HistoryGallery({
  videos,
  activeIndex,
  onSelect,
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
