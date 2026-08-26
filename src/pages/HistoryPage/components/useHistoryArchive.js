import { useEffect, useMemo, useState } from "react";
import { pickSeasonVideos } from "./historyUtils";

export default function useHistoryArchive(data) {
  const [remoteVideos, setRemoteVideos] = useState([]);

  const allVideos = useMemo(
    () => {
      const merged = [...remoteVideos, ...(data.rutubeVideos || [])];
      return [...new Map(merged.map((video) => [video.id || video.url, video])).values()];
    },
    [data.rutubeVideos, remoteVideos],
  );
  const seasonVideos = useMemo(() => pickSeasonVideos(allVideos), [allVideos]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/social-stats", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((payload) => {
        const videos = payload?.stats?.rutube?.videos || [];
        if (videos.length) setRemoteVideos(videos);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return {
    allVideos,
    seasonVideos,
    featured: seasonVideos.at(-1) || allVideos[0],
  };
}
