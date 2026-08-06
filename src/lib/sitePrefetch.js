import { Api } from "../api";
import { preloadPageModule } from "../routes/pageModules";

const routeQueries = {
  "/people": [
    ["organizers", Api.getOrganizers],
    ["responsible", Api.getResponsible],
    ["stories", Api.getStories],
  ],
  "/faculties": [["faculties", Api.getFaculties]],
  "/history": [["history", Api.getHistory]],
  "/partners": [["partners", Api.getPartners]],
  "/events": [["events", Api.getEvents]],
  "/ratings": [["ratings", Api.getRatings]],
  "/profile": [["ratings", Api.getRatings]],
};

const warmedImages = new Set();
const routePrefetches = new Map();

function isLocalOptimizedPersonImage(url, variant) {
  if (!url) return "";
  return url.replace(
    /(\/images\/people\/optimized\/member-\d+)-(?:small|big)(\.webp)$/i,
    `$1-${variant}$2`,
  );
}

function imageUrlsForRoute(pathname, values) {
  if (pathname === "/people") {
    const [organizers = [], responsible = [], stories = []] = values;
    return [
      ...[...organizers, ...responsible]
        .map((person) => isLocalOptimizedPersonImage(person?.smallImage || person?.bigImage, "small")),
      ...stories.map((story) => story?.image || story?.image_url),
    ];
  }
  if (pathname === "/partners") {
    return values.flat().map((partner) => partner?.image);
  }
  if (pathname === "/events") {
    return values.flat().map((event) => event?.image || event?.image_url);
  }
  if (pathname === "/history") {
    const history = values[0];
    return [
      history?.hero?.image,
      ...(history?.chapters || []).slice(0, 5).map((chapter) => chapter.image),
    ];
  }
  return [];
}

function preloadImage(url) {
  if (!url) return;
  const normalized = Api.normalizeURL(url);
  if (!normalized || warmedImages.has(normalized)) return;
  warmedImages.add(normalized);
  const image = new Image();
  image.decoding = "async";
  image.src = normalized;
}

export function prefetchRoute(
  pathname,
  queryClient,
  { data = true, images = false } = {},
) {
  const key = `${pathname}:${data ? 1 : 0}:${images ? 1 : 0}`;
  if (routePrefetches.has(key)) return routePrefetches.get(key);

  const prefetch = (async () => {
    await preloadPageModule(pathname);
    if (!data) return;

    const queries = routeQueries[pathname] || [];
    const values = await Promise.all(
      queries.map(async ([queryKey, queryFn]) => {
        await queryClient.prefetchQuery({
          queryKey: [queryKey],
          queryFn,
          staleTime: 5 * 60 * 1000,
        });
        return queryClient.getQueryData([queryKey]);
      }),
    );

    if (images) {
      imageUrlsForRoute(pathname, values).forEach(preloadImage);
    }
  })().catch((error) => {
    routePrefetches.delete(key);
    throw error;
  });

  routePrefetches.set(key, prefetch);
  return prefetch;
}

function canWarmRoute() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const memory = navigator.deviceMemory || 4;
  return (
    !connection?.saveData
    && !["slow-2g", "2g"].includes(connection?.effectiveType)
    && memory >= 4
    && (navigator.hardwareConcurrency || 4) >= 4
  );
}

export function scheduleSiteWarmup(queryClient) {
  if (!canWarmRoute()) return () => {};

  let cancelled = false;
  let idleId;
  let timeoutId;

  const warm = () => {
    if (cancelled || document.visibilityState !== "visible") return;
    // Подготавливаем только код ближайшего логичного раздела. Данные и
    // изображения грузятся по намерению пользователя, а не целиком при входе.
    const nextRoute = window.location.pathname === "/" ? "/people" : "/";
    prefetchRoute(nextRoute, queryClient, { data: false }).catch(() => null);
  };

  const schedule = () => {
    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(warm, { timeout: 8000 });
    } else {
      timeoutId = window.setTimeout(warm, 6000);
    }
  };

  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });

  return () => {
    cancelled = true;
    window.removeEventListener("load", schedule);
    if (idleId && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
    if (timeoutId) window.clearTimeout(timeoutId);
  };
}
