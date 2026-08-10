import { useEffect } from "react";
import ModalPortal from "../ModalPortal";

export default function HistoryVideo({ video, onClose }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <ModalPortal>
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
            src={`${video.embedUrl}?skinColor=006dff&autoplay=1`}
            title={video.title}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
          <footer>
            <div><span>RUTUBE ARCHIVE</span><h2>{video.title}</h2></div>
            <a href={video.url} target="_blank" rel="noreferrer">ОТКРЫТЬ НА RUTUBE ↗</a>
          </footer>
        </div>
      </div>
    </ModalPortal>
  );
}
