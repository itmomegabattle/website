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

  getStaticEvents() {
    return fetchJson('data/events.json');
  },

  async getEvents() {
    const { getPublishedEvents } = await import("./services/eventService");
    return getPublishedEvents();
  },

  getOrganizers() {
    return fetchJson('data/organizers.json').then(async (fallback) => {
      const { getPublishedTeamMembers } = await import("./services/teamService");
      return getPublishedTeamMembers("organizers", fallback);
    });
  },

  getResponsible() {
    return fetchJson('data/responsible.json').then(async (fallback) => {
      const { getPublishedTeamMembers } = await import("./services/teamService");
      return getPublishedTeamMembers("responsible", fallback);
    });
  },

  getStories() {
    return fetchJson('data/stories.json').then(async (fallback) => {
      const { getPublishedStories } = await import("./services/contentService");
      return getPublishedStories(fallback);
    });
  },

  getPartners() {
    return fetchJson('data/partners.json').then(async (fallback) => {
      const { getPublishedPartners } = await import("./services/contentService");
      return getPublishedPartners(fallback);
    });
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
