import { Api } from "../api";
import "../styles/partners.css";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";

function uniquePartners(partners) {
  return Array.from(
    new Map(partners.map((partner) => [partner.partnerKey || partner.id || partner.link || partner.name, partner])).values(),
  );
}

export default function Partners() {
  const wallRef = useRef(null);

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

  useEffect(() => {
    const wall = wallRef.current;
    if (!wall) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const tracks = Array.from(wall.querySelectorAll(".partners-wall-track"));
    let raf = 0;

    const update = () => {
      raf = 0;

      if (reducedMotion.matches) {
        tracks.forEach((track) => {
          track.style.transform = "translate3d(0, 0, 0)";
        });
        return;
      }

      const rect = wall.getBoundingClientRect();
      const viewport = window.innerHeight || document.documentElement.clientHeight;
      const rawProgress = (viewport - rect.top) / (viewport + rect.height);
      const progress = Math.min(1, Math.max(0, rawProgress));
      const shift = (progress - 0.5) * Math.min(920, Math.max(420, window.innerWidth * 0.58));

      tracks.forEach((track, index) => {
        const direction = Number(track.dataset.direction || 1);
        const speed = Number(track.dataset.speed || 1);
        const drift = index === 1 ? 80 : index === 2 ? -120 : 0;
        track.style.transform = `translate3d(${direction * shift * speed + drift}px, 0, 0)`;
      });
    };

    const requestUpdate = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    reducedMotion.addEventListener?.("change", requestUpdate);

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      reducedMotion.removeEventListener?.("change", requestUpdate);
    };
  }, [rows.length]);

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
      <div className="partners-wall" aria-label="Витрина партнёров" ref={wallRef}>
        <div className="partners-wall__shade partners-wall__shade--top" />
        <div className="partners-wall__shade partners-wall__shade--bottom" />
        <div className="partners-wall__stage">
          {rows.map((row, rowIndex) => (
            <div
              className={`partners-wall-row partners-wall-row--${rowIndex}${rowIndex === 1 ? " partners-wall-row--reverse" : ""}`}
              key={`row-${rowIndex}`}
            >
              <div
                className="partners-wall-track"
                data-direction={rowIndex === 1 ? -1 : 1}
                data-speed={rowIndex === 0 ? 1 : rowIndex === 1 ? 1.18 : 0.84}
              >
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
