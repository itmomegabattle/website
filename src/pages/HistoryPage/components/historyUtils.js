export const pad = (value) => String(value + 1).padStart(2, "0");

export function formatDuration(seconds = 0) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours} ч ${minutes} мин` : `${minutes} мин`;
}

export function seasonNumber(video) {
  return Number(video.title?.match(/(\d+)\s*сезон/i)?.[1] || 0);
}

export function pickSeasonVideos(videos) {
  const seasons = new Map();

  videos.forEach((video) => {
    const season = seasonNumber(video);
    if (!season) return;
    const current = seasons.get(season);
    const isSecondRound = /2\s*раунд/i.test(video.title || "");
    if (!current || isSecondRound) seasons.set(season, video);
  });

  return [...seasons.values()].sort((a, b) => seasonNumber(a) - seasonNumber(b));
}
