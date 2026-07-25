import { Api } from "../api";
import { preloadAllPageModules, preloadPageModule } from "../routes/pageModules";

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
};

const warmedImages = new Set();

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

export async function prefetchRoute(pathname, queryClient, { images = true } = {}) {
  preloadPageModule(pathname);
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
}

function canWarmImages() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return !connection?.saveData && !["slow-2g", "2g"].includes(connection?.effectiveType);
}

export function scheduleSiteWarmup(queryClient) {
  const warm = () => {
    preloadAllPageModules();
    const routes = Object.keys(routeQueries);
    routes.forEach((route, index) => {
      window.setTimeout(
        () => prefetchRoute(route, queryClient, { images: false }).catch(() => null),
        index * 220,
      );
    });
    if (canWarmImages()) {
      window.setTimeout(() => {
        routes.forEach((route, index) => {
          window.setTimeout(
            () => prefetchRoute(route, queryClient, { images: true }).catch(() => null),
            index * 450,
          );
        });
      }, 4200);
    }
  };

  const schedule = () => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(warm, { timeout: 2200 });
    } else {
      window.setTimeout(warm, 650);
    }
  };

  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
}
