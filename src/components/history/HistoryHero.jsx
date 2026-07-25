export default function HistoryHero({ featured, onNavigate }) {
  return (
    <header className="history-hero" id="history-top">
      <div
        className="history-hero__backdrop"
        style={featured ? { backgroundImage: `url("${featured.thumbnail}")` } : undefined}
      />
      <div className="history-hero__film" aria-hidden="true" />
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
      <a
        className="history-scroll-cue"
        href="#origin"
        onClick={(event) => onNavigate(event, "origin")}
      >
        <span>SCROLL TO EXPLORE</span><i>↓</i>
      </a>
    </header>
  );
}
