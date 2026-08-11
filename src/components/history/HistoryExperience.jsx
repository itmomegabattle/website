import { lazy, Suspense, useEffect, useState } from "react";
import HistoryBirth from "./HistoryBirth";
import HistoryChapter from "./HistoryChapter";
import HistoryFacts from "./HistoryFacts";
import HistoryFinal from "./HistoryFinal";
import HistoryHero from "./HistoryHero";
import HistoryOrigin from "./HistoryOrigin";
import HistorySeasonRail from "./HistorySeasonRail";
import HistoryVideo from "./HistoryVideo";
import { seasonNumber } from "./historyUtils";
import useHistoryArchive from "./useHistoryArchive";

const RolesDomeSection = lazy(() => import("../RolesDomeSection"));

export default function HistoryExperience({ data }) {
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeSeason, setActiveSeason] = useState(null);

  useEffect(() => {
    if (!window.location.hash) return undefined;
    let attempts = 0;
    let timer;
    const revealAnchor = () => {
      const target = document.querySelector(window.location.hash);
      if (target) {
        target.scrollIntoView({ block: "start" });
        return;
      }
      attempts += 1;
      if (attempts < 30) timer = window.setTimeout(revealAnchor, 50);
    };
    revealAnchor();
    return () => window.clearTimeout(timer);
  }, []);

  const seasons = data.seasons || [];
  const quickFacts = data.quickFacts || [];
  const {
    allVideos,
    seasonVideos,
    featured,
  } = useHistoryArchive(data);
  const navigateTo = (event, id) => {
    event.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: "smooth" });
    window.history.replaceState(null, "", `#${id}`);
  };

  const activeSeasonIndex = activeSeason ? seasons.indexOf(activeSeason) : -1;
  const activeSeasonVideos = activeSeason
    ? allVideos
      .filter((video) => seasonNumber(video) === activeSeason.number)
      .sort((a, b) => (/1\s*раунд/i.test(a.title || "") ? -1 : 1))
    : [];

  return (
    <>
      <div className="history-world is-entered" aria-hidden={false}>
        <HistoryHero featured={featured} onNavigate={navigateTo} />
        <HistoryOrigin origin={data.origin} />
        <HistoryBirth
          founding={data.founding}
          featured={featured}
          onPlay={setActiveVideo}
        />

        <HistorySeasonRail
          seasons={seasons}
          onOpen={setActiveSeason}
        />

        <section className="history-oath">
          <p1>MEGABATTLE</p1>
          <h2>ЭТО НЕ ТОЛЬКО<br /><em>СЦЕНА</em></h2>
        </section>

        <HistoryFacts facts={quickFacts} />
        <Suspense fallback={<div className="history-roles-deferred" aria-hidden="true" />}>
          <RolesDomeSection />
        </Suspense>
        <HistoryFinal onNavigate={navigateTo} />
      </div>

      {activeVideo && (
        <HistoryVideo video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
      {activeSeason && (
        <HistoryChapter
          season={activeSeason}
          videos={activeSeasonVideos}
          onPlay={(video) => {
            setActiveSeason(null);
            setActiveVideo(video);
          }}
          onClose={() => setActiveSeason(null)}
          onPrevious={activeSeasonIndex > 0
            ? () => setActiveSeason(seasons[activeSeasonIndex - 1])
            : null}
          onNext={activeSeasonIndex < seasons.length - 1
            ? () => setActiveSeason(seasons[activeSeasonIndex + 1])
            : null}
        />
      )}
    </>
  );
}
