const pageLoaders = {
  "/": () => import("../pages/HomePage"),
  "/people": () => import("../pages/PeoplePage"),
  "/faculties": () => import("../pages/FacultiesPage"),
  "/history": () => import("../pages/HistoryPage"),
  "/partners": () => import("../pages/PartnersPage"),
  "/events": () => import("../pages/EventsPage"),
  "/ratings": () => import("../pages/RatingsPage"),
  "/auth": () => import("../pages/AuthPage"),
};

function normalizeRoute(pathname) {
  if (pathname.startsWith("/u/")) return "/ratings";
  if (pathname.startsWith("/nfc/")) return "/ratings";
  if (pathname.startsWith("/auth/")) return "/auth";
  return pathname in pageLoaders ? pathname : "/";
}

export function loadPageModule(pathname) {
  return pageLoaders[normalizeRoute(pathname)]();
}

export function preloadPageModule(pathname) {
  return loadPageModule(pathname).catch(() => null);
}

export const routeModuleLoaders = pageLoaders;
