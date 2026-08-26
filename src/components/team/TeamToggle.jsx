import "./team-toggle.css";

// Переключатель составов команды (организаторы / ответственные).
export default function TeamToggle({ value, onChange }) {
  return (
    <div className="team-filters">
      <div className="team-toggle" data-filter={value}>
        <div className="toggle-slider" />
        <button
          className={`toggle-btn${value === "organizers" ? " active" : ""}`}
          type="button"
          onClick={() => onChange("organizers")}
        >
          Организаторы
        </button>
        <button
          className={`toggle-btn${value === "responsible" ? " active" : ""}`}
          type="button"
          onClick={() => onChange("responsible")}
        >
          Ответственные
        </button>
      </div>
    </div>
  );
}
