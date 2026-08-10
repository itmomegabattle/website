import { useState } from "react";
import HistoryBirth from "./HistoryBirth";
import HistoryChapter from "./HistoryChapter";
import HistoryFacts from "./HistoryFacts";
import HistoryFinal from "./HistoryFinal";
import HistoryGallery from "./HistoryGallery";
import HistoryHero from "./HistoryHero";
import HistoryOrigin from "./HistoryOrigin";
import HistorySeasonRail from "./HistorySeasonRail";
import HistoryVideo from "./HistoryVideo";
import { seasonNumber } from "./historyUtils";
import useHistoryArchive from "./useHistoryArchive";

export default function HistoryExperience({ data }) {
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeSeason, setActiveSeason] = useState(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  const seasons = data.seasons || [];
  const quickFacts = data.quickFacts || [];
  const {
    seasonVideos,
    galleryVideos,
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
  const activeSeasonVideo = activeSeason
    ? seasonVideos.find((video) => seasonNumber(video) === activeSeason.number)
    : null;

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
        <HistoryGallery
          videos={galleryVideos}
          activeIndex={activeGalleryIndex}
          onSelect={setActiveGalleryIndex}
          onPlay={setActiveVideo}
        />
        <HistoryFinal onNavigate={navigateTo} />
      </div>

      {activeVideo && (
        <HistoryVideo video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
      {activeSeason && (
        <HistoryChapter
          season={activeSeason}
          video={activeSeasonVideo}
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
