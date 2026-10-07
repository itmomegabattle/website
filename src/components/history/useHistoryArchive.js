import { useMemo } from "react";
import { pickSeasonVideos } from "./historyUtils";

export default function useHistoryArchive(data) {
  const allVideos = useMemo(
    () => {
      const merged = data.rutubeVideos || [];
      return [...new Map(merged.map((video) => [video.id || video.url, video])).values()];
    },
    [data.rutubeVideos],
  );
  const seasonVideos = useMemo(() => pickSeasonVideos(allVideos), [allVideos]);
  const galleryVideos = useMemo(() => allVideos.slice(0, 8), [allVideos]);

  return {
    allVideos,
    seasonVideos,
    galleryVideos,
    featured: seasonVideos.at(-1) || allVideos[0],
  };
}
