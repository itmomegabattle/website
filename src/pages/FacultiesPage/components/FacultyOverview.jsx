import Card from "../../../common/components/Card";
import ActionLink from "../../../common/components/ActionLink";
import FacultyLogo from "./FacultyLogo";
import { getDepartmentLabel } from "./searchIndex";
import "./faculty-overview.css";

function DepartmentItem({ department }) {
  return (
    <article className="faculty-department">
      <h3 className="faculty-department-name">{getDepartmentLabel(department)}</h3>
      {department.programs?.length ? (
        <ul className="faculty-department-programs">
          {department.programs.map((program) => (
            <li key={`${department.isuId ?? department.name}-${program.name}`}>
              <h4>
                {program.url ? (
                  <ActionLink href={program.url} icon={null}>{program.name}</ActionLink>
                ) : (
                  program.name
                )}
              </h4>
              {program.directions?.length ? (
                <ul className="faculty-direction-list">
                  {program.directions.map((direction) => (
                    <li key={`${direction.code}-${direction.name}`}>
                      <code>{direction.code}</code>
                      <span>{direction.name}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {department.projects?.length ? (
        <div className="faculty-projects">
          <strong>Проекты подразделения</strong>
          <div>
            {department.projects.map((project) => (
              <span key={project.name}>
                {project.name}
                <small>{project.type}</small>
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

export default function FacultyOverview({ faculty, unitTitle }) {
  return (
    <Card as="section" className="faculty-overview">
      <div className="faculty-identity">
        <div className="faculty-identity-logo">
          <FacultyLogo faculty={faculty} />
        </div>
        <div className="faculty-identity-copy">
          <h2 className="card-title">{faculty.title}</h2>
          <p className="faculty-identity-lead">{faculty.description}</p>
          <div className="faculty-identity-actions">
            <ActionLink href={faculty.source}>Программы на сайте ИТМО</ActionLink>
            <ActionLink href={faculty.telegram ?? "https://t.me/itmomegabattle"}>
              Telegram мегафакультета
            </ActionLink>
            <ActionLink href={faculty.responsibleContact ?? "https://t.me/Arshinovoleg"}>
              Контакт мегаответственной
            </ActionLink>
          </div>
        </div>
      </div>

      <div className="faculty-programs">
        <h2 className="card-title faculty-programs-title">{unitTitle}</h2>
        <div className="faculty-department-list">
          {faculty.departments.map((department) => (
            <DepartmentItem
              department={department}
              key={department.isuId ?? getDepartmentLabel(department)}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
