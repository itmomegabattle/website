import { useEffect, useMemo, useState } from "react";
import { pickSeasonVideos } from "./historyUtils";

export default function useHistoryArchive(data) {
  const [remoteVideos, setRemoteVideos] = useState([]);

  const allVideos = useMemo(
    () => (remoteVideos.length ? remoteVideos : (data.rutubeVideos || [])),
    [data.rutubeVideos, remoteVideos],
  );
  const seasonVideos = useMemo(() => pickSeasonVideos(allVideos), [allVideos]);
  const galleryVideos = useMemo(() => allVideos.slice(0, 8), [allVideos]);

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
    galleryVideos,
    featured: seasonVideos.at(-1) || allVideos[0],
  };
}
