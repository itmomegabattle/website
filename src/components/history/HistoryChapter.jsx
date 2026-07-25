import { useEffect, useRef } from "react";

export default function HistoryChapter({
  season,
  video,
  onPlay,
  onClose,
  onPrevious,
  onNext,
}) {
  const swipeStart = useRef(null);

  useEffect(() => {
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const startSwipe = (event) => {
    const point = event.touches?.[0] || event;
    swipeStart.current = { x: point.clientX, y: point.clientY };
  };

  const finishSwipe = (event) => {
    if (!swipeStart.current) return;
    const point = event.changedTouches?.[0] || event;
    const deltaX = point.clientX - swipeStart.current.x;
    const deltaY = point.clientY - swipeStart.current.y;
    swipeStart.current = null;

    if (Math.abs(deltaX) < 54 || Math.abs(deltaX) < Math.abs(deltaY) * 1.15) return;
    if (deltaX < 0) onNext?.();
    else onPrevious?.();
  };

  return (
    <div
      className="history-chapter"
      role="dialog"
      aria-modal="true"
      aria-label={`Сезон ${season.number}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <article
        className="history-chapter__panel"
        onTouchStart={startSwipe}
        onTouchEnd={finishSwipe}
        onPointerDown={(event) => event.pointerType !== "touch" && startSwipe(event)}
        onPointerUp={(event) => event.pointerType !== "touch" && finishSwipe(event)}
      >
        <button type="button" className="history-chapter__close" onClick={onClose} aria-label="Закрыть">×</button>
        <div className="history-chapter__visual" style={{ "--history-image": `url("${season.image}")` }}>
          <img src={season.image} alt="" width="1280" height="960" />
          <span>CHAPTER {String(season.number).padStart(2, "0")}</span>
          <strong>{season.years}</strong>
        </div>
        <div className="history-chapter__body">
          <span className="history-section-tag">СЕЗОН {season.number} / {season.years}</span>
          <h2>{season.title}</h2>
          <p className="history-chapter__lead">{season.summary}</p>
          <p>{season.text}</p>
          <div className="history-chapter__meta">
            <span><b>ИТОГ</b>{season.winner}</span>
            {season.organizer && <span><b>КОМАНДА</b>{season.organizer}</span>}
          </div>
          <div className="history-chapter__tags">
            {season.highlights?.map((item) => <span key={item}>{item}</span>)}
          </div>
          {video && (
            <button type="button" className="history-chapter__play" onClick={() => onPlay(video)}>
              СМОТРЕТЬ ЗАПИСЬ РАУНДА <i>▶</i>
            </button>
          )}
        </div>
      </article>
    </div>
  );
}
