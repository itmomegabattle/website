import Modal from "../../../common/components/Modal";
import "./history-video.css";

export default function HistoryVideo({ video, onClose }) {
  return (
    <Modal label={video.title} onClose={onClose} backdropClassName="history-video" className="history-video__panel">
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
    </Modal>
  );
}
