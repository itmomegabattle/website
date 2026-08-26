import "./history-final.css";

export default function HistoryFinal({ onNavigate }) {
  return (
    <footer className="history-final">
      <span>ИСТОРИЯ ПРОДОЛЖАЕТСЯ</span>
      <h2>СЛЕДУЮЩАЯ<br />ГЛАВА — ТВОЯ</h2>
      <a href="#history-top" onClick={(event) => onNavigate(event, "history-top")}>
        ВЕРНУТЬСЯ В НАЧАЛО
      </a>
    </footer>
  );
}
