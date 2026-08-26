import { useRef } from "react";
import Modal from "../../common/components/Modal";

export default function HistoryChapter({
  season,
  videos = [],
  onPlay,
  onClose,
  onPrevious,
  onNext,
}) {
  const swipeStart = useRef(null);

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
    <Modal
      label={`Сезон ${season.number}`}
      onClose={onClose}
      backdropClassName="history-chapter"
      className="history-chapter__panel"
      onTouchStart={startSwipe}
      onTouchEnd={finishSwipe}
      onPointerDown={(event) => event.pointerType !== "touch" && startSwipe(event)}
      onPointerUp={(event) => event.pointerType !== "touch" && finishSwipe(event)}
    >
      <div className="history-chapter__visual" style={{ "--history-image": `url("${season.image}")` }}>
        <img src={season.image} alt="" width="1280" height="960" />
        <span>CHAPTER {String(season.number).padStart(2, "0")}</span>
        <strong>{season.years}</strong>
      </div>
      <div className="history-chapter__body">
        <h2>{season.title}</h2>
        <p className="history-chapter__lead">{season.summary}</p>
        <p>{season.text}</p>
        <div className="history-chapter__meta">
          <span><b>ИТОГ</b>{season.winner}</span>
        </div>
        <div className="history-chapter__tags">
          {season.highlights?.map((item) => <span key={item}>{item}</span>)}
        </div>
        {!!videos.length && (
          <div className="history-chapter__videos">
            {videos.map((video) => (
              <button key={video.id || video.url} type="button" className="history-chapter__play" onClick={() => onPlay(video)}>
                {(/1\s*раунд/i.test(video.title || "") ? "ОСЕННИЙ КОНЦЕРТ" : "ВЕСЕННИЙ КОНЦЕРТ")} <i>▶</i>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
