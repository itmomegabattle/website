import { Api } from "../../../../api";
import { getMemberCardImage } from "./memberImages";
import "./member-card.css";

// Карточка участника. В полном виде — подпись деятельности, имя и call-to-action,
// в компактном (nameOnly) — только имя; размер задает сетка родителя.
export default function MemberCard({ member, index = 0, onOpen, nameOnly = false }) {
  const className = `people-person-card${nameOnly ? " people-person-card--compact" : ""}`;
  const style = {
    "--person-index": String(index + 1).padStart(2, "0"),
    "--person-tilt": `${((index * 11) % 5 - 2) * 0.22}deg`,
    "--person-shift": `${[0, 1.7, 0.55, 2.25, 0.9][index % 5]}rem`,
  };
  const content = (
    <>
      <span className="people-person-card__media">
        <img
          src={Api.normalizeURL(getMemberCardImage(member))}
          alt=""
          width="480"
          height="640"
          loading={index < 4 ? "eager" : "lazy"}
          fetchPriority={index < 2 ? "high" : "auto"}
          decoding="async"
        />
      </span>
      <span className="people-person-card__copy">
        {!nameOnly && <small>{member.activity || "Команда Megabattle"}</small>}
        <strong>{member.name}</strong>
      </span>
    </>
  );

  if (onOpen) {
    return (
      <button className={className} type="button" onClick={() => onOpen(member)} style={style}>
        {content}
      </button>
    );
  }

  return (
    <article className={className} style={style}>
      {content}
    </article>
  );
}
