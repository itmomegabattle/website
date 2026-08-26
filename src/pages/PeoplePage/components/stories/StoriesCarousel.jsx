import { useEffect, useMemo, useState } from "react";
import { Api } from "../../../../api";
import { ChevronLeftIcon, ChevronRightIcon } from "../../../../common/components/ChevronIcons";
import Modal from "../../../../common/components/Modal";

const MONTH_BY_LABEL = {
  января: 0, февраля: 1, марта: 2, апреля: 3, мая: 4, июня: 5,
  июля: 6, августа: 7, сентября: 8, октября: 9, ноября: 10, декабря: 11,
};

// Дата истории хранится человекочитаемой подписью («2 ноября 2024»);
// у историй из БД дополнительно есть createdAt.
function storyTimestamp(story) {
  const match = String(story.date || "").toLowerCase().match(/(\d{1,2})\s+([а-яё]+)\s+(\d{4})/);
  if (match && MONTH_BY_LABEL[match[2]] !== undefined) {
    return new Date(Number(match[3]), MONTH_BY_LABEL[match[2]], Number(match[1])).getTime();
  }
  const created = Date.parse(story.createdAt || "");
  return Number.isNaN(created) ? 0 : created;
}

export default function StoriesCarousel({ stories }) {
  const [page, setPage] = useState(0);
  const [openedStory, setOpenedStory] = useState(null);
  const storyPages = useMemo(() => {
    const sorted = [...stories].sort((a, b) => storyTimestamp(b) - storyTimestamp(a));
    const pages = [];
    for (let index = 0; index < sorted.length; index += 4) pages.push(sorted.slice(index, index + 4));
    return pages.length ? pages : [[]];
  }, [stories]);

  useEffect(() => setPage(0), [stories.length]);

  const goToPage = (direction) => {
    setPage((current) => (current + direction + storyPages.length) % storyPages.length);
  };

  if (!stories.length) return null;

  return (
    <>
      <div className="stories-carousel">
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
                  {story.description && <p className="story-description">{story.description}</p>}
                  {story.date && <p className="story-date">{story.date}</p>}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="stories-carousel-controls" aria-label="Управление историями">
          <button type="button" onClick={() => goToPage(-1)} aria-label="Предыдущие истории"><ChevronLeftIcon /></button>
          <button type="button" onClick={() => goToPage(1)} aria-label="Следующие истории"><ChevronRightIcon /></button>
        </div>
      </div>
      {openedStory && (
        <Modal label={openedStory.name} onClose={() => setOpenedStory(null)} className="story-modal">
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
        </Modal>
      )}
    </>
  );
}
