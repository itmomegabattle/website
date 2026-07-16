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

  async getRatings() {
    const fallback = await fetchJson('data/ratings.json');
    try {
      const apiBase = (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000").replace(/\/+$/, "");
      const response = await fetch(`${apiBase}/api/v1/game/leaderboard?limit=100`);
      if (!response.ok) return fallback;
      const data = await response.json();
      return {
        ...fallback,
        facultyLeaderboard: (data.faculties || []).map((item) => ({ place: item.place, faculty: item.faculty, name: item.faculty, score: item.balance })),
        participantLeaderboard: (data.participants || []).map((item) => ({ place: Number(item.place), nickname: item.nickname, score: Number(item.xp), badge: item.full_name || "" })),
      };
    } catch { return fallback; }
  }
};
