import "./external-arrow-icon.css";

// Единая SVG-стрелка внешней ссылки (вместо символа шрифта «↗»).
export default function ExternalArrowIcon({ className = "" }) {
  return (
    <svg
      className={className ? `external-arrow-icon ${className}` : "external-arrow-icon"}
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path
        d="M4.5 11.5 11.5 4.5M6.5 4.5h5v5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
