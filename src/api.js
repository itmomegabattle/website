const API_BASE = `${import.meta.env.BASE_URL}`;

async function fetchJson(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }
  return response.json();
}

export const Api = {
  normalizeURL(url) {
    if (!url) return "";
    if (/^(https?:|data:|blob:)/i.test(url)) return url;
    const optimizedStaticImages = {
      "/images/about-image.png": "/images/about-image.webp",
      "/images/events/event1.jpg": "/images/events/event1.webp",
      "/images/events/event2.jpg": "/images/events/event2.webp",
      "/images/partners/double.png": "/images/partners/double.webp",
      "/images/partners/drinkit.png": "/images/partners/drinkit.webp",
      "/images/partners/kaori.jpg": "/images/partners/kaori.webp",
      "/images/partners/perekr.jpeg": "/images/partners/perekr.webp",
      "/images/partners/podpisn.jpeg": "/images/partners/podpisn.webp",
    };
    url = optimizedStaticImages[url] || url;
    if (url.startsWith('/')) url = url.slice(1);
    return `${API_BASE}${url}`;
  },

  getStaticEvents() {
    return fetchJson('data/events.json');
  },

  getEvents() { return fetchJson('data/events.json'); },

  getOrganizers() { return fetchJson('data/organizers.json'); },

  getResponsible() { return fetchJson('data/responsible.json'); },

  getContributors() { return fetchJson('data/contributors.json'); },

  getStories() { return fetchJson('data/stories.json'); },

  getPartners() { return fetchJson('data/partners.json'); },

  getFaculties() {
    return fetchJson('data/faculties.json');
  },

  getHistory() {
    return fetchJson('data/history.json');
  },

  getExternalPr() {
    return fetchJson('data/external-pr.json');
  },

  getRatings() { return fetchJson('data/ratings.json'); }
};
