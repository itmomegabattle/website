import "./history-hero.css";

export default function HistoryHero() {
  return (
    <header className="history-hero" id="history-top">
      <div className="history-hero__title">
        <span>THE STORY OF</span>
        <img
          className="history-hero__logo"
          src="/history-logo.svg"
          alt="ITMO Megabattle"
          width="420"
          height="256"
        />
        <p>2018—now</p>
      </div>
    </header>
  );
}
