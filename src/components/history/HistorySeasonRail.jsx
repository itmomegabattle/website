import HistorySeasonCard from "./HistorySeasonCard";

export default function HistorySeasonRail({
  seasons,
  railRef,
  onOpen,
  onWheel,
  onSwipeStart,
  onSwipeEnd,
}) {
  return (
    <section
      className="history-seasons"
      id="seasons"
      ref={railRef}
      style={{ "--season-count": Math.max(1, seasons.length) }}
      onWheel={onWheel}
      onTouchStart={onSwipeStart}
      onTouchEnd={onSwipeEnd}
      onPointerDown={(event) => event.pointerType !== "touch" && onSwipeStart(event)}
      onPointerUp={(event) => event.pointerType !== "touch" && onSwipeEnd(event)}
    >
      <div className="history-seasons__sticky">
        <div className="history-seasons__heading">
          <h2>ГЛАВЫ<br />ИСТОРИИ</h2>
          <p>Нажми на сезон, чтобы открыть факты, события, результат и подтверждённые имена.</p>
        </div>
        <div className="history-seasons__track">
          {seasons.map((season, index) => (
            <HistorySeasonCard
              key={season.number}
              season={season}
              index={index}
              onOpen={onOpen}
            />
          ))}
        </div>
        <div className="history-seasons__progress" aria-hidden="true"><i /></div>
      </div>
    </section>
  );
}
