import { useEffect, useState } from "react";
import { Api } from "../../../../api";
import Modal from "../../../../common/components/Modal";
import ActionLink from "../../../../common/components/ActionLink";
import MemberCard from "./MemberCard";
import { getMemberDetailImage } from "./memberImages";

export default function MemberRoster({ section, members }) {
  const [activeMember, setActiveMember] = useState(null);

  useEffect(() => setActiveMember(null), [members]);

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
        <Modal label={activeMember.name} onClose={() => setActiveMember(null)} className="people-member-modal">
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
                {activeMember.links.map((item, i) => <ActionLink key={i} href={item.link}>{item.text || "Ссылка"}</ActionLink>)}
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
