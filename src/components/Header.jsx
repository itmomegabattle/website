import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/header.css";
import { Theme } from "../theme";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchRoute } from "../lib/sitePrefetch";
import DesktopHeader from "./header/DesktopHeader";
import MobileHeader from "./header/MobileHeader";

const navItems = [
  { to: "/", label: "Главная" },
  { to: "/people", label: "Люди" },
  { to: "/faculties", label: "Факультеты" },
  { to: "/history", label: "История" },
  { to: "/events", label: "Мероприятия" },
  { to: "/ratings", label: "Профиль" },
];

function isActiveRoute(pathname, to) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState(Theme.get());
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia("(min-width: 800px)").matches,
  );
  const warmTimerRef = useRef(null);
  const isDarkTheme = theme === "dark";

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 800px)");
    const handler = (event) => setIsDesktop(event.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    Theme.addListener(setTheme, false);
    return () => Theme.removeListener(setTheme);
  }, []);

  useEffect(() => () => window.clearTimeout(warmTimerRef.current), []);

  const handleThemeToggle = () => {
    Theme.set(isDarkTheme ? "light" : "dark");
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

  const prefetchOnTouch = (to) => {
    prefetchRoute(to, queryClient, { data: false }).catch(() => null);
  };

  const handleNavigation = (event, to) => {
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

  const sharedProps = {
    navItems: navItems.map((item) => ({
      ...item,
      isActive: isActiveRoute(location.pathname, item.to),
    })),
    isDarkTheme,
    handleThemeToggle,
    handleNavigation,
  };

  return isDesktop ? (
    <DesktopHeader {...sharedProps} warmRoute={warmRoute} cancelWarmRoute={cancelWarmRoute} />
  ) : (
    <MobileHeader {...sharedProps} prefetchOnTouch={prefetchOnTouch} />
  );
}
