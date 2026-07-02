import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Api } from "../api";

function FacultyLogo({ faculty }) {
  if (faculty.logo) {
    return (
      <img className="faculty-node-logo" src={Api.normalizeURL(faculty.logo)} alt={faculty.name} />
    );
  }

  return (
    <span className="faculty-node-logo faculty-node-logo--parts" aria-label={faculty.name}>
      {faculty.logoParts?.map((part) => (
        <img src={Api.normalizeURL(part)} alt="" aria-hidden="true" key={part} />
      ))}
    </span>
  );
}

function FacultyInfo({ faculty }) {
  return (
    <article className="info-card faculty-detail-card">
      <p className="card-kicker">{faculty.tag}</p>
      <h2>{faculty.title}</h2>
      <p>{faculty.description}</p>
      <p className="faculty-vibe">{faculty.vibe}</p>

      <div className="faculty-detail-grid">
        <div>
          <h3>Факультеты / направления</h3>
          <div className="pill-row">
            {faculty.departments.map((department) => (
              <span className="pill" key={department}>
                {department}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h3>В Megabattle</h3>
          <div className="pill-row">
            {faculty.megabattle.map((role) => (
              <span className="pill" key={role}>
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="faculty-meta">
        <span>{faculty.short}</span>
        <a className="text-button" href={faculty.source} target="_blank" rel="noreferrer">
          Направления на abit.itmo.ru
        </a>
      </div>
    </article>
  );
}

export default function FacultyMap() {
  const faculties = useQuery({
    queryKey: ["faculties"],
    queryFn: Api.getFaculties,
    initialData: [],
  }).data;

  const [activeId, setActiveId] = useState("ktu");
  const activeFaculty = useMemo(
    () => faculties.find((faculty) => faculty.id === activeId) ?? faculties[0] ?? null,
    [faculties, activeId],
  );

  if (!activeFaculty) {
    return null;
  }

  return (
    <div
      className="faculty-map-section"
      style={{ "--active-faculty-color": activeFaculty.color }}
    >
      <div className="faculty-map-shell">
        <div className="faculty-map-orbit" aria-hidden="true" />
        <svg
          className="faculty-map-lines"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M50 18 C66 20 78 29 80 42" />
          <path d="M80 42 C79 60 72 72 68 78" />
          <path d="M68 78 C54 86 42 86 32 78" />
          <path d="M32 78 C22 68 18 55 20 42" />
          <path d="M20 42 C25 28 35 20 50 18" />
          <path d="M50 18 L50 50" />
          <path d="M80 42 L50 50" />
          <path d="M68 78 L50 50" />
          <path d="M32 78 L50 50" />
          <path d="M20 42 L50 50" />
        </svg>

        {faculties.map((faculty) => (
          <button
            className={`faculty-map-node${
              faculty.id === activeFaculty.id ? " faculty-map-node--active" : ""
            }`}
            key={faculty.id}
            type="button"
            style={{
              "--node-x": `${faculty.x}%`,
              "--node-y": `${faculty.y}%`,
              "--node-color": faculty.color,
            }}
            onClick={() => setActiveId(faculty.id)}
            aria-label={faculty.title}
            aria-pressed={faculty.id === activeFaculty.id}
          >
            <FacultyLogo faculty={faculty} />
          </button>
        ))}

        <div className="faculty-map-core">
          <img
            src={Api.normalizeURL("/images/faculties/megabattle.svg")}
            alt="ITMO Megabattle"
          />
        </div>
      </div>

      <FacultyInfo faculty={activeFaculty} />
    </div>
  );
}
