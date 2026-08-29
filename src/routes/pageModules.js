const pageLoaders = {
  "/": () => import("../pages/HomePage"),
  "/people": () => import("../pages/PeoplePage"),
  "/faculties": () => import("../pages/FacultiesPage"),
  "/history": () => import("../pages/HistoryPage"),
  "/partners": () => import("../pages/PartnersPage"),
  "/events": () => import("../pages/EventsPage"),
};

function normalizeRoute(pathname) {
  if (pathname.startsWith("/u/")) return "/";
  if (pathname.startsWith("/nfc/")) return "/";
  if (pathname.startsWith("/auth/")) return "/";
  return pathname in pageLoaders ? pathname : "/";
}

export function loadPageModule(pathname) {
  return pageLoaders[normalizeRoute(pathname)]();
}

export function preloadPageModule(pathname) {
  return loadPageModule(pathname).catch(() => null);
}

export const routeModuleLoaders = pageLoaders;
