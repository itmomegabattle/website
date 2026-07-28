import { useEffect, useState } from "react";
import { Api } from "../../api";
import ExternalLink from "../ExternalLink";
import { getMemberCardImage, getMemberDetailImage } from "./memberImages";

export default function MemberRoster({ members }) {
  const [activeMember, setActiveMember] = useState(null);
  const [isRosterReady, setIsRosterReady] = useState(false);

  useEffect(() => setActiveMember(null), [members]);
  useEffect(() => {
    let cancelled = false;
    setIsRosterReady(false);
    const sources = [...new Set(
      members
        .map((member) => Api.normalizeURL(getMemberCardImage(member)))
        .filter(Boolean),
    )];
    if (!sources.length) {
      setIsRosterReady(true);
      return undefined;
    }

    Promise.allSettled(
      sources.map((src) => new Promise((resolve) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = resolve;
        image.onerror = resolve;
        image.src = src;
        if (image.complete) resolve();
      })),
    ).then(() => {
      if (!cancelled) setIsRosterReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [members]);
  useEffect(() => {
    if (!activeMember) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setActiveMember(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeMember]);

  return (
    <>
      <div
        className={`people-roster${isRosterReady ? " is-ready" : " is-preparing"}`}
        aria-busy={!isRosterReady}
      >
        {members.map((member, index) => (
          <button
            key={member.key ?? `${member.name}-${member.activity}`}
            className={`people-person-card people-person-card--${(index % 7) + 1}`}
            type="button"
            onClick={() => setActiveMember(member)}
            style={{
              "--person-index": String(index + 1).padStart(2, "0"),
              "--person-tilt": `${((index * 11) % 5 - 2) * 0.22}deg`,
              "--person-shift": `${[0, 1.7, 0.55, 2.25, 0.9][index % 5]}rem`,
            }}
          >
            <span className="people-person-card__media">
              <img
                src={Api.normalizeURL(getMemberCardImage(member))}
                alt={member.name}
                width="480"
                height="640"
                loading="eager"
                decoding="async"
              />
            </span>
            <span className="people-person-card__copy">
              <small>{member.activity || "Команда Megabattle"}</small>
              <strong>{member.name}</strong>
              <em>Открыть профиль ↗</em>
            </span>
          </button>
        ))}
      </div>
      {activeMember && (
        <div className="people-member-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setActiveMember(null);
        }}>
          <article className="people-member-modal" role="dialog" aria-modal="true" aria-label={activeMember.name}>
            <button className="people-member-modal__close" type="button" aria-label="Закрыть" onClick={() => setActiveMember(null)}>×</button>
            <div className="people-member-modal__image">
              <img
                src={Api.normalizeURL(getMemberDetailImage(activeMember))}
                alt={activeMember.name}
                width="900"
                height="1200"
                decoding="async"
              />
            </div>
            <div className="people-member-modal__copy">
              <p className="people-member-modal__kicker">{activeMember.activity || "Команда Megabattle"}</p>
              <h3>{activeMember.name}</h3>
              {activeMember.role && <p className="people-member-modal__role">{activeMember.role}</p>}
              {activeMember.description && <p className="people-member-modal__description">{activeMember.description}</p>}
              {activeMember.links?.length > 0 && (
                <div className="people-member-modal__links">
                  {activeMember.links.map((item, i) => <ExternalLink key={i} href={item.link} text={item.text} />)}
                </div>
              )}
            </div>
          </article>
        </div>
      )}
    </>
  );
}
