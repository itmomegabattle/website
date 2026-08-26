import "./toggle.css";

// Сегментный переключатель. Число опций произвольное: колонки и позиция
// ползунка управляются CSS-переменными --toggle-count / --toggle-index.
export default function Toggle({ options, value, onChange, label, className = "", wrapClassName = "" }) {
  const activeIndex = Math.max(0, options.findIndex((option) => option.value === value));

  return (
    <div className={wrapClassName ? `team-filters ${wrapClassName}` : "team-filters"}>
      <div
        className={className ? `team-toggle ${className}` : "team-toggle"}
        data-filter={value}
        role="tablist"
        aria-label={label}
        style={{ "--toggle-count": options.length, "--toggle-index": activeIndex }}
      >
        <span className="toggle-slider" aria-hidden="true" />
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={value === option.value}
            className={`toggle-btn${value === option.value ? " active" : ""}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
