export default function HistoryFacts({ facts }) {
  return (
    <section className="history-facts" id="facts">
      <header><h2>ПРОЕКТ<br />В ЦИФРАХ</h2></header>
      <div className="history-facts__grid">
        {facts.map((fact, index) => (
          <article
            key={`${fact.value}-${fact.label}`}
            className={`history-fact history-fact--${(index % 8) + 1}`}
          >
            <strong>{fact.value}</strong>
            <h3>{fact.label}</h3>
            <p>{fact.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
