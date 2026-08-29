import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/header.css";
import { Theme } from "../theme";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchRoute } from "../lib/sitePrefetch";
import { showPreloaderAfterReload, startThemeChangePreloader } from "./Preloader";

function SunIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path
        d="M12 5V3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 21V19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16.9498 7.04996L18.364 5.63574"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M5.63608 18.3644L7.05029 16.9502"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M19 12L21 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M3 12L5 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16.9498 16.95L18.364 18.3643"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M5.63608 5.63559L7.05029 7.0498"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M7.92784 4.99961C9.04082 4.35704 10.244 4.01263 11.4452 3.94131C12.0598 3.90481 12.0597 4.92421 11.5265 5.23204C8.65672 6.88889 7.67333 10.5586 9.33019 13.4283C10.9871 16.298 14.6568 17.2814 17.5265 15.6246C18.0598 15.3167 18.9423 15.8258 18.6031 16.3399C17.9407 17.3441 17.0407 18.2135 15.9278 18.8561C12.1016 21.0651 7.20927 19.7545 5.00011 15.9283C2.79099 12.102 4.10157 7.20878 7.92784 4.99961Z"
        fill="currentColor"
      />
    </svg>
  );
}

function BurgerIcon({ open }) {
  return (
    <span className={`burger-icon${open ? " burger-icon--open" : ""}`} aria-hidden="true">
      <span />
      <span />
    </span>
  );
}

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

export default function Header() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState(Theme.get());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const warmTimerRef = useRef(null);
  const isDarkTheme = theme === "dark";
  const navItems = [
    { to: "/", label: "Главная" },
    { to: "/people", label: "Люди" },
    { to: "/faculties", label: "Факультеты" },
    { to: "/history", label: "История" },
    { to: "/events", label: "Мероприятия" },
    { to: "/ratings", label: "Рейтинг" },
  ];

  useEffect(() => {
    Theme.addListener(setTheme, false);
    return () => Theme.removeListener(setTheme);
  }, []);

  useEffect(() => () => window.clearTimeout(warmTimerRef.current), []);

  const handleThemeToggle = async () => {
    const nextTheme = isDarkTheme ? "light" : "dark";
    showPreloaderAfterReload();
    await startThemeChangePreloader();
    Theme.remember(nextTheme);
    window.location.reload();
  };

  const warmRoute = (to, immediate = false) => {
    window.clearTimeout(warmTimerRef.current);
    const run = () => {
      prefetchRoute(to, queryClient, { data: true, images: false }).catch(() => null);
    };
    if (immediate) run();
    else warmTimerRef.current = window.setTimeout(run, 120);
  };

  const cancelWarmRoute = () => {
    window.clearTimeout(warmTimerRef.current);
  };

  const handleNavigation = (event, to) => {
    setIsMenuOpen(false);
    if (
      event.defaultPrevented
      || event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
      || !document.startViewTransition
    ) return;
    event.preventDefault();
    document.startViewTransition(() => navigate(to));
  };

  return (
    <>
      {isMenuOpen && (
        <button
          className="mobile-menu-backdrop"
          type="button"
          aria-label="Закрыть меню"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      <header className={`header${isMenuOpen ? " header--menu-open" : ""}`}>
      <button
        type="button"
        className="burger-toggle header-item"
        onClick={() => setIsMenuOpen((open) => !open)}
        aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
        aria-expanded={isMenuOpen}
      >
        <BurgerIcon open={isMenuOpen} />
      </button>
      <nav className="header-nav" aria-label="Основная навигация">
        {navItems.map((item) => (
          <Link
            className="header-item"
            to={item.to}
            key={item.to}
            onPointerEnter={() => warmRoute(item.to)}
            onPointerLeave={cancelWarmRoute}
            onFocus={() => warmRoute(item.to, true)}
            onTouchStart={() => prefetchRoute(item.to, queryClient, { data: false }).catch(() => null)}
            onClick={(event) => handleNavigation(event, item.to)}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <button
        type="button"
        className="theme-toggle mobile-theme-toggle header-item"
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
          className="header-item header-link"
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
    </>
  );
}
