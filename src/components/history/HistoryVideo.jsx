import { useEffect } from "react";

export default function HistoryVideo({ video, onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="history-video"
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="history-video__panel">
        <button type="button" className="history-video__close" onClick={onClose} aria-label="Закрыть">×</button>
        <iframe
          src={`${video.embedUrl}?skinColor=006dff`}
          title={video.title}
          allow="clipboard-write; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
        <footer>
          <div><span>RUTUBE ARCHIVE</span><h2>{video.title}</h2></div>
          <a href={video.url} target="_blank" rel="noreferrer">ОТКРЫТЬ НА RUTUBE ↗</a>
        </footer>
      </div>
    </div>
  );
}
