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
    if (url.startsWith('/')) url = url.slice(1);
    return `${API_BASE}${url}`;
  },

  getEvents() {
    return fetchJson('data/events.json');
  },

  getOrganizers() {
    return fetchJson('data/organizers.json');
  },

  getResponsible() {
    return fetchJson('data/responsible.json');
  },

  getStories() {
    return fetchJson('data/stories.json');
  },

  getPartners() {
    return fetchJson('data/partners.json');
  },

  getFaculties() {
    return fetchJson('data/faculties.json');
  },

  getHistory() {
    return fetchJson('data/history.json');
  },

  getExternalPr() {
    return fetchJson('data/external-pr.json');
  },

  getRatings() {
    return fetchJson('data/ratings.json');
  }
};
