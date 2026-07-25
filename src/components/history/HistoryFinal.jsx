export default function HistoryFinal({ onNavigate }) {
  return (
    <footer className="history-final">
      <p1>ИСТОРИЯ ПРОДОЛЖАЕТСЯ</p1>
      <h2>СЛЕДУЮЩАЯ<br />ГЛАВА — ТВОЯ</h2>
      <a href="#history-top" onClick={(event) => onNavigate(event, "history-top")}>
        ВЕРНУТЬСЯ В НАЧАЛО
      </a>
    </footer>
  );
}
