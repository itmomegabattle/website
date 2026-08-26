import { useEffect, useRef, useState } from "react";
import { Api } from "../../api";
import ExternalLink from "../ExternalLink";
import ModalPortal from "../ModalPortal";
import MemberCard from "./MemberCard";
import { getMemberDetailImage } from "./memberImages";

export default function MemberRoster({ section, members }) {
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
          <MemberCard
            key={`${section}-${member.key ?? `${member.name}-${member.activity}`}`}
            member={member}
            index={index}
            onOpen={setActiveMember}
          />
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
                  {activeMember.activity && activeMember.activity !== activeMember.role && (
                    <p className="people-member-modal__kicker">{activeMember.activity}</p>
                  )}
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
