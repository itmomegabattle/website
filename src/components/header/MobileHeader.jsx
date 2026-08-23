import { useState } from "react";
import { Link } from "react-router-dom";
import { MoonIcon, SunIcon } from "./HeaderIcons";

function BurgerIcon({ open }) {
  return (
    <span className={`burger-icon${open ? " burger-icon--open" : ""}`} aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </span>
  );
}

export default function MobileHeader({
  navItems,
  isDarkTheme,
  handleThemeToggle,
  handleNavigation,
  prefetchOnTouch,
}) {
  const [isOpen, setOpen] = useState(false);

  const handleNavClick = (event, to) => {
    setOpen(false);
    handleNavigation(event, to);
  };

  return (
    <header className="header phone-header">
      <div className="header-upper-menu">
        <button
          type="button"
          className="open-toggle header-item"
          onClick={() => setOpen((open) => !open)}
          aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={isOpen}
          title={isOpen ? "Закрыть" : "Открыть"}
        >
          <BurgerIcon open={isOpen} />
        </button>
      </div>

      <nav
        aria-label="Основная навигация"
        className={`header-lower-menu${isOpen ? "" : " header-lower-menu--closed"}`}
        inert={!isOpen ? "" : undefined}
      >
        <button
          type="button"
          className="theme-toggle header-item"
          onClick={handleThemeToggle}
          aria-label={
            isDarkTheme ? "Включить светлую тему" : "Включить темную тему"
          }
          title={isDarkTheme ? "Светлая тема" : "Темная тема"}
        >
          {isDarkTheme ? <SunIcon /> : <MoonIcon />}
        </button>

        {navItems.map((item) => (
          <Link
            onClick={(event) => handleNavClick(event, item.to)}
            onTouchStart={() => prefetchOnTouch(item.to)}
            className={`header-item${item.isActive ? " header-item--active" : ""}`}
            to={item.to}
            key={item.to}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
