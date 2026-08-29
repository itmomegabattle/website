import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Api } from "../api";
import "../styles/partners-bento.css";

function uniquePartners(partners) {
  return Array.from(
    new Map(partners.map((partner) => [partner.sourceKey || partner.partnerKey || partner.link || partner.name, partner])).values(),
  );
}

export default function PartnersBento() {
  const [activeGroup, setActiveGroup] = useState("regular");
  const partners = useQuery({ queryKey: ["partners"], queryFn: Api.getPartners, placeholderData: [] }).data;
  const visiblePartners = useMemo(() => uniquePartners(partners), [partners]);
  const groupedPartners = useMemo(
    () => visiblePartners.filter((partner) => (partner.partnerGroup || (String(partner.sourceKey || "").startsWith("general:") ? "general" : "regular")) === activeGroup),
    [visiblePartners, activeGroup],
  );

  return (
    <div className="partners-bento-section">
      <div className="partners-group-tabs" role="tablist" aria-label="Категории партнёров">
        <button
          type="button"
          role="tab"
          aria-selected={activeGroup === "regular"}
          className={activeGroup === "regular" ? "is-active" : ""}
          onClick={() => setActiveGroup("regular")}
        >
          Партнёры
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeGroup === "general"}
          className={activeGroup === "general" ? "is-active" : ""}
          onClick={() => setActiveGroup("general")}
        >
          Генеральные партнёры
        </button>
      </div>
      <div className="partners-bento">
        {groupedPartners.map((partner, index) => (
            <article
              key={partner.id || partner.sourceKey || partner.partnerKey || `${partner.name}-${index}`}
              className={`partner-bento-card partner-bento-card--${index % 5}`}
              aria-label={partner.name}
            >
              <div className="partner-bento-media">
                <div className="partner-bento-logo">
                  <img
                    src={Api.normalizeURL(partner.logo)}
                    alt={partner.name}
                    width="640"
                    height="640"
                    loading="lazy"
                    decoding="async"
                    onError={(event) => { event.currentTarget.src = Api.normalizeURL("/images/about-image.webp"); }}
                  />
                </div>
              </div>
              <div className="partner-bento-info">
                <h3>{partner.name}</h3>
                {partner.description && <p className="partner-bento-description">{partner.description}</p>}
                {partner.description && (
                  <details className="partner-bento-details">
                    <summary>Подробнее</summary>
                    <p>{partner.description}</p>
                  </details>
                )}
                {partner.link && (
                  <a className="partner-bento-link" href={partner.link} target="_blank" rel="noreferrer">
                    Открыть сайт
                    <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
            </article>
        ))}
      </div>
      {!groupedPartners.length && (
        <p className="partners-empty">
          {activeGroup === "general"
            ? "Генеральные партнёры появятся здесь."
            : "Партнёры пока не добавлены."}
        </p>
      )}
    </div>
  );
}
