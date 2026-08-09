import RoleIcon from "../components/roles/RoleIcon";
import { roleItems } from "../components/roles/roleData";
import "../styles/roles.css";


const scatterPattern = [
  [2, 2, -3, -8], [1, 2, 2, 8], [1, 1, -1, -4], [2, 2, 3, 5],
  [1, 2, -2, 10], [1, 1, 1, -7], [2, 2, -1, 3], [1, 2, 3, -2],
  [1, 1, -3, 8], [2, 2, 2, -6], [1, 2, -1, 5], [1, 1, 2, -9],
  [2, 2, -2, 6], [1, 2, 1, -5], [1, 1, -3, 9], [2, 2, 3, -3],
];

const scatterLift = [-8, 6, -2, 10, -5, 3, 8, -7, 2, -10, 5, -3, 9, -6, 1, 7];

export default function RolesPage() {
  return (
    <main className="roles-page" aria-labelledby="roles-title">
      <header className="roles-hero">
        <h1 id="roles-title">РОЛИ</h1>
        <p className="roles-intro">
          Один проект — десятки способов быть внутри. Наводи на предметы,
          исследуй их и находи своё место в большой команде.
        </p>
      </header>

      <section className="roles-universe" aria-label="Роли в проекте">
        <div className="roles-universe__count" aria-hidden="true">
          <strong>{roleItems.length}</strong>
          <span>точки входа</span>
        </div>
        <p className="roles-universe__whisper roles-universe__whisper--one" aria-hidden="true">
          СЦЕНА / МЕДИА / ТЕХНИКА / МОДА / СПОРТ
        </p>
        <p className="roles-universe__whisper roles-universe__whisper--two" aria-hidden="true">
          ВЫБИРАЙ НЕ ДОЛЖНОСТЬ — ВЫБИРАЙ, ЧТО ХОЧЕТСЯ СОЗДАТЬ
        </p>

        <div className="roles-scatter">
          {roleItems.map((role, index) => {
            const [span, row, rotation, shift] = scatterPattern[index % scatterPattern.length];
            const lift = scatterLift[index % scatterLift.length];
            return (
            <button
              className={`role-object role-object--${role.type}`}
              type="button"
              key={role.id}
              aria-label={`${role.name}. ${role.description}`}
              style={{
                "--span": span,
                "--row": row,
                "--r": `${rotation}deg`,
                "--shift": `${shift}%`,
                "--lift": `${lift}px`,
                "--delay": `${(index % 9) * -0.37}s`,
              }}
            >
              <span className="role-object__index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="role-object__art" aria-hidden="true">
                <RoleIcon type={role.type} />
              </span>
              <span className="role-object__label">
                <strong>{role.name}</strong>
                <small>{role.description}</small>
              </span>
            </button>
            );
          })}
        </div>
      </section>

      <aside className="roles-note">
        <span>Не нашёл точное название?</span>
        <p>В Megabattle роли появляются вместе с идеями. Можно прийти со своим навыком и придумать новую.</p>
      </aside>
    </main>
  );
}
