import { useEffect, useMemo, useState } from "react";
import { Api } from "../../api";
import ModalPortal from "../ModalPortal";

export default function StoriesCarousel({ stories }) {
  const [page, setPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [openedStory, setOpenedStory] = useState(null);
  const progressMs = 22000;
  const storyPages = useMemo(() => {
    const pages = [];
    for (let index = 0; index < stories.length; index += 4) pages.push(stories.slice(index, index + 4));
    return pages.length ? pages : [[]];
  }, [stories]);

  useEffect(() => setPage(0), [stories.length]);
  useEffect(() => {
    if (storyPages.length <= 1 || isPaused || openedStory) return undefined;
    const timer = window.setTimeout(() => setPage((current) => (current + 1) % storyPages.length), progressMs);
    return () => window.clearTimeout(timer);
  }, [isPaused, openedStory, page, storyPages.length]);

  const goToPage = (direction) => {
    setPage((current) => (current + direction + storyPages.length) % storyPages.length);
  };

  if (!stories.length) return null;

  return (
    <>
      <div
        className={`stories-carousel${isPaused || openedStory ? " stories-carousel--paused" : ""}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
      >
        <div className="stories-carousel-window" aria-label="Истории участников">
          {storyPages.map((items, pageIndex) => (
            <div className={`stories-page${pageIndex === page ? " stories-page--active" : ""}`} key={`stories-page-${pageIndex}`}>
              {items.map((story, idx) => (
                <button className="story-card" key={story.key ?? `${story.name}-${idx}`} data-tag={idx % 3} type="button" onClick={() => setOpenedStory(story)}>
                  <div className="story-image-container">
                    <img
                      src={Api.normalizeURL(story.image)}
                      alt={story.name}
                      className="story-image"
                      width="640"
                      height="640"
                      loading={pageIndex === 0 ? "eager" : "lazy"}
                      decoding="async"
                    />
                  </div>
                  <h3 className="story-name">{story.name}</h3>
                  <p className="story-faculty">{story.faculty}</p>
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="stories-progress-track" aria-hidden="true">
          <span className="stories-progress-fill" key={page} style={{ "--stories-progress-ms": `${progressMs}ms` }} />
        </div>
        <div className="stories-carousel-controls" aria-label="Управление историями">
          <button type="button" onClick={() => goToPage(-1)} aria-label="Предыдущие истории">‹</button>
          <button type="button" onClick={() => goToPage(1)} aria-label="Следующие истории">›</button>
        </div>
        <p className="stories-carousel-hint">Наведи, чтобы остановить · нажми карточку, чтобы открыть</p>
      </div>
      {openedStory && (
        <ModalPortal>
          <div className="story-modal-backdrop" role="presentation" onClick={() => setOpenedStory(null)}>
            <article className="story-modal" role="dialog" aria-modal="true" aria-label={openedStory.name} onClick={(event) => event.stopPropagation()}>
              <button className="story-modal-close" type="button" onClick={() => setOpenedStory(null)} aria-label="Закрыть историю">×</button>
              <div className="story-image-container story-modal-image">
                <img
                  src={Api.normalizeURL(openedStory.image)}
                  alt={openedStory.name}
                  className="story-image"
                  width="640"
                  height="640"
                  decoding="async"
                />
              </div>
              <h2>{openedStory.name}</h2>
              <p className="story-faculty">{openedStory.faculty}</p>
              <p className="story-modal-description">{openedStory.description}</p>
              <p className="story-date">{openedStory.date}</p>
            </article>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
