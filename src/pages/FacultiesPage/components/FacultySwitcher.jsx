import "./faculty-switcher.css";

export default function FacultySwitcher({ faculties, activeId, onSelect }) {
  return (
    <div className="faculty-switcher" aria-label="Выбор мегафакультета">
      {faculties.map((faculty) => {
        const isActive = faculty.id === activeId;

        return (
          <button
            type="button"
            className={`faculty-switcher-item${isActive ? " is-active" : ""}`}
            key={faculty.id}
            aria-pressed={isActive}
            onClick={() => onSelect(faculty)}
          >
            <strong>{faculty.name}</strong>
          </button>
        );
      })}
    </div>
  );
}
