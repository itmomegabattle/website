import "./history-birth.css";

export default function HistoryBirth({ founding, featured, onPlay }) {
  return (
    <section className="history-plot history-plot--birth" id="plot">
      <div className="history-plot__copy">
        <h2>РОЖДЕНИЕ<br />MEGABATTLE</h2>
        <p>{founding?.text || "ITMO.Megabattle объединил университетские традиции в одну годовую систему."}</p>
        {featured && (
          <button type="button" onClick={() => onPlay(featured)}>
            <span>СМОТРЕТЬ КОНЦЕРТ</span><i>▶</i>
          </button>
        )}
      </div>
      <div className="history-plot__orbit" aria-hidden="true"><i /><i /><i /></div>
    </section>
  );
}
