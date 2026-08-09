import { useEffect, useRef, useState } from "react";
import { Api } from "../../api";
import ExternalLink from "../ExternalLink";
import ModalPortal from "../ModalPortal";
import { getMemberCardImage, getMemberDetailImage } from "./memberImages";

export default function MemberRoster({ members }) {
  const [activeMember, setActiveMember] = useState(null);
  const closeButtonRef = useRef(null);

  useEffect(() => setActiveMember(null), [members]);
  useEffect(() => {
    if (!activeMember) return undefined;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setActiveMember(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => closeButtonRef.current?.focus({ preventScroll: true }));
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeMember]);

  return (
    <>
      <div className="people-roster is-ready">
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
                loading={index < 4 ? "eager" : "lazy"}
                fetchPriority={index < 2 ? "high" : "auto"}
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
        <ModalPortal>
          <div className="people-member-modal-backdrop" role="presentation" onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveMember(null);
          }}>
            <article className="people-member-modal" role="dialog" aria-modal="true" aria-label={activeMember.name}>
              <button ref={closeButtonRef} className="people-member-modal__close" type="button" aria-label="Закрыть" onClick={() => setActiveMember(null)}>×</button>
              <div className="people-member-modal__image">
                <img
                  src={Api.normalizeURL(getMemberDetailImage(activeMember))}
                  alt={activeMember.name}
                  width="900"
                  height="1200"
                  decoding="async"
                />
                <span className="people-member-modal__image-label">Megabattle · team</span>
              </div>
              <div className="people-member-modal__copy">
                <header className="people-member-modal__header">
                  <p className="people-member-modal__kicker">{activeMember.activity || "Команда Megabattle"}</p>
                  <h3>{activeMember.name}</h3>
                  {activeMember.role && <p className="people-member-modal__role">{activeMember.role}</p>}
                </header>
                {activeMember.description && (
                  <section className="people-member-modal__about">
                    <p className="people-member-modal__description">{activeMember.description}</p>
                  </section>
                )}
                {activeMember.links?.length > 0 && (
                  <div className="people-member-modal__links">
                    {activeMember.links.map((item, i) => <ExternalLink key={i} href={item.link} text={item.text} />)}
                  </div>
                )}
              </div>
            </article>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
