import { Api } from "../api";
import "../styles/partners.css";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

function uniquePartners(partners) {
  return Array.from(
    new Map(partners.map((partner) => [partner.partnerKey || partner.id || partner.link || partner.name, partner])).values(),
  );
}

export default function Partners() {
  // получить данные с API (или из кэша)
  const partners = useQuery({
    queryKey: ["partners"],
    queryFn: Api.getPartners,
    initialData: [],
  }).data;

  const visiblePartners = useMemo(() => uniquePartners(partners), [partners]);
  const wallPartners = visiblePartners.length ? visiblePartners : partners;
  const rows = [0, 1, 2].map((rowIndex) => {
    const shifted = wallPartners.slice(rowIndex).concat(wallPartners.slice(0, rowIndex));
    const base = Array.from({ length: 2 }, () => shifted).flat();
    const filled = [...base, ...base];
    return filled;
  });

  const renderCard = (p, uniqueKey, index) => {
    return (
      <a
        key={uniqueKey}
        className={`partner-wall-card partner-wall-card--${index % 7}`}
        href={p.link || undefined}
        target={p.link ? "_blank" : undefined}
        rel={p.link ? "noreferrer" : undefined}
        aria-label={p.name}
      >
        <div className="partner-wall-card__media">
          <img src={Api.normalizeURL(p.logo)} alt={p.name} loading="lazy" />
        </div>
        <div className="partner-wall-card__caption">
          <span>Партнёр</span>
          <strong>{p.name}</strong>
        </div>
      </a>
    );
  };

  return (
    <div className="partners-section">
      <div className="partners-wall" aria-label="Витрина партнёров">
        <div className="partners-wall__shade partners-wall__shade--top" />
        <div className="partners-wall__shade partners-wall__shade--bottom" />
        <div className="partners-wall__stage">
          {rows.map((row, rowIndex) => (
            <div
              className={`partners-wall-row partners-wall-row--${rowIndex}${rowIndex === 1 ? " partners-wall-row--reverse" : ""}`}
              key={`row-${rowIndex}`}
            >
              <div className="partners-wall-track">
                {row.map((partner, index) => renderCard(partner, `row-${rowIndex}-${partner.partnerKey || partner.id || partner.name}-${index}`, index + rowIndex))}
              </div>
            </div>
          ))}
          <div className="partners-wall-marquee" aria-hidden="true">
            ITMO MEGABATTLE · PARTNERS · ITMO MEGABATTLE · PARTNERS ·
          </div>
        </div>
      </div>
    </div>
  );
}
