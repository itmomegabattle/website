import { pad } from "./historyUtils";
import ExternalArrowIcon from "../../../common/components/ExternalArrowIcon";

export default function HistorySeasonCard({ season, index, onOpen }) {
  return (
    <article className="history-season-card">
      <button type="button" onClick={() => onOpen(season)} aria-label={`Открыть историю ${season.number} сезона`}>
        <span className="history-season-card__media" style={{ "--history-image": `url("${season.image}")` }}>
          <img src={season.image} alt="" width="1280" height="960" loading="lazy" />
          <span className="history-season-card__shade" />
        </span>
        <span className="history-season-card__number">{pad(index)}</span>
        <span className="history-season-card__copy">
          <small>СЕЗОН {season.number} · {season.years}</small>
          <strong>{season.title}</strong>
          <span>{season.summary}</span>
          <span className="history-season-card__result">
            <b>{season.winner}</b>
          </span>
          <i>ОТКРЫТЬ ГЛАВУ <ExternalArrowIcon /></i>
        </span>
      </button>
    </article>
  );
}
