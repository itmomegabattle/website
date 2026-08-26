import { Api } from "../../../api";
import "./faculty-logo.css";

export default function FacultyLogo({ faculty }) {
  if (faculty.id === "ftmf") {
    return (
      <span className="faculty-logo-wordmark" aria-label={`Логотип ${faculty.name}`}>
        ФТМФ
      </span>
    );
  }

  if (faculty.logo) {
    return (
      <img
        className="faculty-logo"
        src={Api.normalizeURL(faculty.logo)}
        alt={`Логотип ${faculty.name}`}
      />
    );
  }

  return (
    <span className="faculty-logo faculty-logo--parts" aria-label={`Логотип ${faculty.name}`}>
      {faculty.logoParts?.map((part) => (
        <img src={Api.normalizeURL(part)} alt="" aria-hidden="true" key={part} />
      ))}
    </span>
  );
}
