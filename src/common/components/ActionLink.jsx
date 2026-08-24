import { Link } from "react-router-dom";
import "./action-link.css";

// Единая текстовая ссылка проекта: капс с разрядкой и стрелкой.
// Внутренние переходы — через `to`, внешние — через `href`.
// Вместо стрелки можно передать свою иконку через `icon`.
export default function ActionLink({ to, href, icon = "↗", className = "", children, ...props }) {
  const linkClassName = className ? `action-link ${className}` : "action-link";
  const content = (
    <>
      <span className="action-link__label">{children}</span>
      <span className="action-link__icon" aria-hidden="true">{icon}</span>
    </>
  );

  if (href) {
    return (
      <a className={linkClassName} href={href} target="_blank" rel="noreferrer" {...props}>
        {content}
      </a>
    );
  }

  return (
    <Link className={linkClassName} to={to} {...props}>
      {content}
    </Link>
  );
}
