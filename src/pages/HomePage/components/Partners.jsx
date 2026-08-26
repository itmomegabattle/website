import { Api } from "../../../api";
import ActionLink from "../../../common/components/ActionLink";
import "./partners.css";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "../../../common/components/Modal";
import { PartnerEditor } from "../../../components/PartnersBento";
import { useAuth } from "../../../context/AuthContext";
import { isAdminProfile } from "../../../services/adminService";

function uniquePartners(partners) {
  return Array.from(
    new Map(partners.map((partner) => [partner.partnerKey || partner.id || partner.link || partner.name, partner])).values(),
  );
}

export default function Partners() {
  const wallRef = useRef(null);
  const { profile } = useAuth();
  const canEdit = isAdminProfile(profile);
  const [activePartner, setActivePartner] = useState(null);

  // получить данные с API (или из кэша)
  const partners = useQuery({
    queryKey: ["partners"],
    queryFn: Api.getPartners,
    placeholderData: [],
  }).data;

  const visiblePartners = useMemo(() => uniquePartners(partners), [partners]);
  const wallPartners = visiblePartners.length ? visiblePartners : partners;
  const getPartnerGroup = (partner) =>
    partner.partnerGroup || (String(partner.sourceKey || partner.source_key || "").startsWith("general:") ? "general" : "regular");
  const rows = [0, 1, 2, 3].map((rowIndex) => {
    const shifted = wallPartners.slice(rowIndex).concat(wallPartners.slice(0, rowIndex));
    const repeatCount = Math.max(2, Math.ceil(8 / Math.max(shifted.length, 1)));
    return Array.from({ length: repeatCount }, () => shifted).flat();
  });

  useEffect(() => {
    const wall = wallRef.current;
    if (!wall) return undefined;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const tracks = Array.from(wall.querySelectorAll(".partners-wall-track"));
    let raf = 0;

    const update = () => {
      raf = 0;
      if (reducedMotion.matches) {
        tracks.forEach((track) => { track.style.transform = "translate3d(0,0,0)"; });
        return;
      }
      const rect = wall.getBoundingClientRect();
      const viewport = window.innerHeight || document.documentElement.clientHeight;
      const progress = Math.min(1, Math.max(0, (viewport - rect.top) / (viewport + rect.height)));
      const mobileFactor = window.innerWidth <= 560 ? .22 : 1;
      const shift = (progress - .5) * Math.min(920, Math.max(420, window.innerWidth * .58)) * mobileFactor;
      tracks.forEach((track, index) => {
        const direction = Number(track.dataset.direction || 1);
        const speed = Number(track.dataset.speed || 1);
        const drift = (index === 1 ? 80 : index === 2 ? -120 : index === 3 ? 45 : 0) * mobileFactor;
        track.style.transform = `translate3d(${direction * shift * speed + drift}px,0,0)`;
      });
    };
    const requestUpdate = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
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

  useEffect(() => {
    if (!activePartner) return undefined;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setActivePartner(null);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePartner]);

  const renderCard = (p, uniqueKey, index) => {
    return (
      <button
        key={uniqueKey}
        type="button"
        className={`partner-wall-card partner-wall-card--${index % 7}`}
        aria-label={p.name}
        onClick={() => setActivePartner(p)}
      >
        <div className="partner-wall-card__media">
          <img
            src={Api.normalizeURL(p.logo)}
            alt={p.name}
            width="960"
            height="640"
            loading="lazy"
            decoding="async"
          />
        </div>
      </button>
    );
  };

  return (
    <div className="partners-section">
      {canEdit && <PartnerEditor fallbackPartners={partners} />}
      <div className="partners-wall" aria-label="Витрина партнёров" ref={wallRef}>
        <div className="partners-wall__shade partners-wall__shade--top" />
        <div className="partners-wall__shade partners-wall__shade--bottom" />
        <div className="partners-wall__stage">
          {rows.map((row, rowIndex) => (
            <div
              className={`partners-wall-row partners-wall-row--${rowIndex}${rowIndex % 2 === 1 ? " partners-wall-row--reverse" : ""}`}
              key={`row-${rowIndex}`}
            >
              <div
                className="partners-wall-track"
                data-direction={rowIndex % 2 === 1 ? -1 : 1}
                data-speed={rowIndex === 0 ? 1 : rowIndex === 1 ? 1.18 : rowIndex === 2 ? 0.84 : 1.06}
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
      {activePartner && (
        <Modal
          label={`Партнёр: ${activePartner.name}`}
          onClose={() => setActivePartner(null)}
          className="partner-detail-modal"
        >
              <div className="partner-detail-logo">
                <img
                  src={Api.normalizeURL(activePartner.logo)}
                  alt={activePartner.name}
                  width="720"
                  height="420"
                  decoding="async"
                />
              </div>
              <div className="partner-detail-content">
                <p className="card-kicker">
                  {getPartnerGroup(activePartner) === "general"
                    ? "Генеральный партнёр"
                    : "Партнёр"}
                </p>
                <h2>{activePartner.name}</h2>
                <p>
                  {activePartner.description ||
                    "Подробная информация о партнёре появится здесь после заполнения описания в редакторе."}
                </p>
                {activePartner.link && (
                  <ActionLink className="partner-detail-link" href={activePartner.link}>
                    Открыть сайт
                  </ActionLink>
                )}
              </div>
        </Modal>
      )}
    </div>
  );
}
