import { Link } from "react-router-dom";
import ExternalArrowIcon from "./ExternalArrowIcon";
import "./action-link.css";

// Единая текстовая ссылка проекта: капс с разрядкой и стрелкой.
// Внутренние переходы — через `to`, внешние — через `href`,
// без того и другого рендерится кнопка в том же виде (действие в интерфейсе).
// Вместо стрелки можно передать свою иконку через `icon`; `icon={null}` убирает её.
export default function ActionLink({ to, href, icon = <ExternalArrowIcon />, className = "", children, ...props }) {
  const linkClassName = className ? `action-link ${className}` : "action-link";
  const content = (
    <>
      <span className="action-link__label">{children}</span>
      {icon ? <span className="action-link__icon" aria-hidden="true">{icon}</span> : null}
    </>
  );

  if (href) {
    return (
      <a className={linkClassName} href={href} target="_blank" rel="noreferrer" {...props}>
        {content}
      </a>
    );
  }

  if (to) {
    return (
      <Link className={linkClassName} to={to} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button className={linkClassName} type="button" {...props}>
      {content}
    </button>
  );
}
