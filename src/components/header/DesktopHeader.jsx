import { Link } from "react-router-dom";
import { MoonIcon, SunIcon } from "./HeaderIcons";

function OuterCorner({ tag }) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      className="outer-corner"
      data-tag={tag}
    >
      <path d="M 33 3.5 A 30 30 0 0 0 3.5 33 L 0 33 L 0 0 L 33 0 Z" />
      <path d="M 33 3.5 A 30 30 0 0 0 3.5 33" />
    </svg>
  );
}

function InnerSpace() {
  return (
    <svg
      width="1000"
      height="100"
      viewBox="0 0 1000 100"
      xmlns="http://www.w3.org/2000/svg"
      className="inner-space"
    >
      <path d="M 0 0 L 999.5 0 L 999.5 69.5 A 30 30 0 0 1 969.5 99.5 L 0 99.5 Z" />
    </svg>
  );
}

export default function DesktopHeader({
  navItems,
  isDarkTheme,
  handleThemeToggle,
  warmRoute,
  cancelWarmRoute,
  handleNavigation,
}) {
  return (
    <header className="header desktop-header">
      {navItems.map((item) => (
        <Link
          className={`header-item header-link${item.isActive ? " header-item--active" : ""}`}
          to={item.to}
          key={item.to}
          onPointerEnter={() => warmRoute(item.to)}
          onPointerLeave={cancelWarmRoute}
          onFocus={() => warmRoute(item.to, true)}
          onClick={(event) => handleNavigation(event, item.to)}
        >
          {item.label}
        </Link>
      ))}
      <button
        type="button"
        className="theme-toggle desktop-theme-toggle header-item"
        onClick={handleThemeToggle}
        aria-label={
          isDarkTheme ? "Включить светлую тему" : "Включить темную тему"
        }
        title={isDarkTheme ? "Светлая тема" : "Темная тема"}
      >
        {isDarkTheme ? <SunIcon /> : <MoonIcon />}
      </button>

      <InnerSpace />
      <OuterCorner tag="1" />
      <OuterCorner tag="2" />
    </header>
  );
}
