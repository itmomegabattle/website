import { useEffect, useMemo, useRef, useState } from "react";

const pad = (value) => String(value + 1).padStart(2, "0");

function formatDuration(seconds = 0) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours} ч ${minutes} мин` : `${minutes} мин`;
}

function seasonNumber(video) {
  return Number(video.title?.match(/(\d+)\s*сезон/i)?.[1] || 0);
}

function pickSeasonVideos(videos) {
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

function HistoryAccess({ ready, progress, onEnter }) {
  return (
    <section className="history-access" aria-label="Загрузка истории">
      <div className="history-access__image" aria-hidden="true" />
      <div className="history-access__content">
        <p>ITMO MEGABATTLE</p>
        <h1>ИСТОРИЯ</h1>
        <div className="history-access__meter"><i style={{ width: `${progress}%` }} /></div>
        <strong>{progress}%</strong>
        <button type="button" disabled={!ready} onClick={onEnter}>
          {ready ? "НАЧАТЬ ИСТОРИЮ" : "ЗАГРУЗКА"}
        </button>
      </div>
    </section>
  );
}

function HistoryVideo({ video, onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="history-video" role="dialog" aria-modal="true" aria-label={video.title} onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className="history-video__panel">
        <button type="button" className="history-video__close" onClick={onClose} aria-label="Закрыть">×</button>
        <iframe
          src={`${video.embedUrl}?skinColor=006dff`}
          title={video.title}
          allow="clipboard-write; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
        <footer>
          <div><span>RUTUBE ARCHIVE</span><h2>{video.title}</h2></div>
          <a href={video.url} target="_blank" rel="noreferrer">ОТКРЫТЬ НА RUTUBE ↗</a>
        </footer>
      </div>
    </div>
  );
}

function SeasonCard({ season, index, onOpen }) {
  return (
    <article className="history-season-card" style={{ "--card": index, "--card-lift": index % 2 }}>
      <button type="button" onClick={() => onOpen(season)} aria-label={`Открыть историю ${season.number} сезона`}>
        <span className="history-season-card__media" style={{ "--history-image": `url("${season.image}")` }}>
          <img src={season.image} alt="" width="1280" height="960" loading="lazy" />
          <span className="history-season-card__shade" />
        </span>
        <span className="history-season-card__number">{pad(index)}</span>
        <span className="history-season-card__copy">
          <small>СЕЗОН {season.number} · {season.years}</small>
          <strong>{season.title}</strong>
          <span>{season.summary}</span>
          <span className="history-season-card__result">
            <b>{season.winner}</b>
            {season.organizer && <em>{season.organizer}</em>}
          </span>
          <span className="history-season-card__highlights">
            {season.highlights?.slice(0, 3).map((item) => <em key={item}>{item}</em>)}
          </span>
          <i>ОТКРЫТЬ ГЛАВУ ↗</i>
        </span>
      </button>
      <div className="history-season-card__date" aria-hidden="true">
        <i />
        <strong>{season.years}</strong>
        <span>СЕЗОН {season.number}</span>
      </div>
    </article>
  );
}

function HistoryChapter({ season, video, onPlay, onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="history-chapter" role="dialog" aria-modal="true" aria-label={`Сезон ${season.number}`} onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <article className="history-chapter__panel">
        <button type="button" className="history-chapter__close" onClick={onClose} aria-label="Закрыть">×</button>
        <div className="history-chapter__visual" style={{ "--history-image": `url("${season.image}")` }}>
          <img src={season.image} alt="" width="1280" height="960" />
          <span>CHAPTER {String(season.number).padStart(2, "0")}</span>
          <strong>{season.years}</strong>
        </div>
        <div className="history-chapter__body">
          <span className="history-section-tag">СЕЗОН {season.number} / {season.years}</span>
          <h2>{season.title}</h2>
          <p className="history-chapter__lead">{season.summary}</p>
          <p>{season.text}</p>
          <div className="history-chapter__meta">
            <span><b>ИТОГ</b>{season.winner}</span>
            {season.organizer && <span><b>КОМАНДА</b>{season.organizer}</span>}
          </div>
          <div className="history-chapter__tags">
            {season.highlights?.map((item) => <span key={item}>{item}</span>)}
          </div>
          {video && <button type="button" className="history-chapter__play" onClick={() => onPlay(video)}>СМОТРЕТЬ ЗАПИСЬ РАУНДА <i>▶</i></button>}
        </div>
      </article>
    </div>
  );
}

export default function HistoryExperience({ data }) {
  const [entered] = useState(true);
  const [ready, setReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [remoteVideos, setRemoteVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeSeason, setActiveSeason] = useState(null);
  const railRef = useRef(null);

  const allVideos = useMemo(() => (
    remoteVideos.length ? remoteVideos : (data.rutubeVideos || [])
  ), [data.rutubeVideos, remoteVideos]);

  const seasonVideos = useMemo(() => pickSeasonVideos(allVideos), [allVideos]);
  const galleryVideos = useMemo(() => allVideos.slice(0, 8), [allVideos]);
  const seasons = data.seasons || [];
  const quickFacts = data.quickFacts || [];
  const featured = seasonVideos.at(-1) || allVideos[0];

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/social-stats", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload) => {
        const videos = payload?.stats?.rutube?.videos || [];
        if (videos.length) setRemoteVideos(videos);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    let progress = 0;
    const timer = window.setInterval(() => {
      progress = Math.min(94, progress + (progress < 60 ? 8 : 3));
      setLoadProgress(progress);
    }, 90);

    const posters = [
      ...(data.seasons || []).slice(0, 4).map((season) => season.image),
      ...(data.rutubeVideos || []).slice(0, 2).map((video) => video.thumbnail),
    ].filter(Boolean);
    const preload = Promise.all(posters.map((src) => new Promise((resolve) => {
      const image = new Image();
      image.onload = image.onerror = resolve;
      image.src = src;
    })));
    const minimum = new Promise((resolve) => window.setTimeout(resolve, 1600));

    Promise.all([preload, minimum]).then(() => {
      window.clearInterval(timer);
      setLoadProgress(100);
      window.setTimeout(() => setReady(true), 260);
    });

    return () => window.clearInterval(timer);
  }, [data.rutubeVideos, data.seasons]);

  useEffect(() => {
    if (entered) return undefined;
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    return () => { document.body.style.overflow = ""; };
  }, [entered]);

  useEffect(() => {
    if (!entered) return undefined;
    let frame = 0;
    const update = () => {
      const rail = railRef.current;
      if (rail) {
        const rect = rail.getBoundingClientRect();
        const travel = Math.max(1, rail.offsetHeight - window.innerHeight);
        const progress = Math.min(1, Math.max(0, -rect.top / travel));
        const track = rail.querySelector(".history-seasons__track");
        const trackLeft = track ? parseFloat(window.getComputedStyle(track).left) || 0 : 0;
        const horizontalTravel = Math.max(0, (track?.scrollWidth || 0) + trackLeft - window.innerWidth + window.innerWidth * 0.1);
        rail.style.setProperty("--rail-progress", progress.toFixed(4));
        rail.style.setProperty("--rail-x", `${(-progress * horizontalTravel).toFixed(1)}px`);
      }
      document.documentElement.style.setProperty("--history-scroll", String(window.scrollY));
      frame = 0;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [entered, seasons.length]);

  const navigateTo = (event, id) => {
    event.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: "smooth" });
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <>
      <div className="history-world is-entered" aria-hidden={false}>
        <header className="history-hero" id="history-top">
          <div className="history-hero__backdrop" style={featured ? { backgroundImage: `url("${featured.thumbnail}")` } : undefined} />
          <div className="history-hero__film" aria-hidden="true" />
          <div className="history-hero__title">
            <span>THE STORY OF</span>
            <img
              className="history-hero__logo"
              src="/history-logo.svg"
              alt="ITMO Megabattle"
              width="420"
              height="256"
            />
            <p>2018—2026</p>
          </div>
          <a className="history-scroll-cue" href="#origin" onClick={(event) => navigateTo(event, "origin")}><span>SCROLL TO EXPLORE</span><i>↓</i></a>
        </header>

        {data.origin && (
          <section className="history-origin" id="origin">
            <div className="history-origin__copy">
              <span className="history-section-tag">00 / ЗАРОЖДЕНИЕ / {data.origin.eyebrow}</span>
              <h2>{data.origin.title}</h2>
              <p className="history-origin__lead">{data.origin.lead}</p>
              <p>{data.origin.text}</p>
              <blockquote>{data.origin.note}</blockquote>
            </div>
            <div className="history-origin__media">
              <figure className="history-origin__photo history-origin__photo--main" style={{ "--history-image": `url("${data.origin.image}")` }}>
                <img src={data.origin.image} alt="Общий снимок финала «Весны в ИТМО»" width="1600" height="1067" loading="lazy" />
                <figcaption>Финал «Весны в ИТМО» · 2018</figcaption>
              </figure>
              <figure className="history-origin__photo history-origin__photo--archive" style={{ "--history-image": `url("${data.origin.archiveImage}")` }}>
                <img src={data.origin.archiveImage} alt="Архивный кадр фестиваля «Весна в ИТМО»" width="1200" height="800" loading="lazy" />
                <figcaption>«Весна в ИТМО» · 2015</figcaption>
              </figure>
              <span className="history-origin__stamp">ДО<br />MEGA<br />BATTLE</span>
            </div>
          </section>
        )}

        <section className="history-plot history-plot--birth" id="plot">
          <span className="history-section-tag">01 / РОЖДЕНИЕ</span>
          <div className="history-plot__copy">
            <small>{data.founding?.date || "03.09.2018"}</small>
            <h2>РОЖДЕНИЕ<br />MEGABATTLE</h2>
            <p>{data.founding?.text || "ITMO.Megabattle объединил университетские традиции в одну годовую систему."}</p>
            {featured && <button type="button" onClick={() => setActiveVideo(featured)}><span>СМОТРЕТЬ КОНЦЕРТ</span><i>▶</i></button>}
          </div>
          <div className="history-plot__orbit" aria-hidden="true"><i /><i /><i /></div>
        </section>

        <section className="history-seasons" id="seasons" ref={railRef} style={{ "--season-count": Math.max(1, seasons.length) }}>
          <div className="history-seasons__sticky">
            <div className="history-seasons__heading">
              <span className="history-section-tag">03 / СЕЗОНЫ</span>
              <h2>ГЛАВЫ<br />ИСТОРИИ</h2>
              <p>Нажми на сезон, чтобы открыть факты, события, результат и подтверждённые имена.</p>
            </div>
            <div className="history-seasons__track">
              {seasons.map((season, index) => <SeasonCard key={season.number} season={season} index={index} onOpen={setActiveSeason} />)}
            </div>
            <div className="history-seasons__progress" aria-hidden="true"><i /></div>
          </div>
        </section>

        <section className="history-oath">
          <div className="history-oath__image" style={featured ? { backgroundImage: `url("${featured.thumbnail}")` } : undefined} />
          <p>MEGABATTLE</p>
          <h2>ЭТО НЕ ТОЛЬКО<br /><em>СЦЕНА</em></h2>
          <span>ЛЮДИ · КОМАНДА · ПАМЯТЬ</span>
        </section>

        <section className="history-facts" id="facts">
          <header><span className="history-section-tag">06 / МАСШТАБ И ФОРМАТЫ</span><h2>ПРОЕКТ<br />В ЦИФРАХ</h2></header>
          <div className="history-facts__grid">
            {quickFacts.map((fact, index) => (
              <article key={`${fact.value}-${fact.label}`} className={`history-fact history-fact--${(index % 8) + 1}`}>
                <strong>{fact.value}</strong><h3>{fact.label}</h3><p>{fact.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="history-gallery" id="gallery">
          <header><span className="history-section-tag">08 / ВИДЕОАРХИВ</span><h2>ГАЛЕРЕЯ КОНЦЕРТОВ</h2></header>
          <div className="history-gallery__stage">
            {galleryVideos[0] && (
              <button type="button" className="history-gallery__feature" onClick={() => setActiveVideo(galleryVideos[0])}>
                <img src={galleryVideos[0].thumbnail} alt="" width="1280" height="720" loading="lazy" />
                <span><small>ITMO MEGABATTLE · ВИДЕОАРХИВ</small><b>{galleryVideos[0].title}</b><i>{formatDuration(galleryVideos[0].duration)} · СМОТРЕТЬ ▶</i></span>
              </button>
            )}
            <div className="history-gallery__rail">
              {galleryVideos.slice(1).map((video) => (
                <button type="button" key={video.id} className="history-gallery__item" onClick={() => setActiveVideo(video)}>
                  <img src={video.thumbnail} alt="" width="1280" height="720" loading="lazy" />
                  <span><b>{video.title}</b><i>{formatDuration(video.duration)} · PLAY ↗</i></span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <footer className="history-final">
          <span>ИСТОРИЯ ПРОДОЛЖАЕТСЯ</span>
          <h2>СЛЕДУЮЩАЯ<br />ГЛАВА — ТВОЯ</h2>
          <a href="#history-top" onClick={(event) => navigateTo(event, "history-top")}>ВЕРНУТЬСЯ В НАЧАЛО ↑</a>
        </footer>
      </div>

      {activeVideo && <HistoryVideo video={activeVideo} onClose={() => setActiveVideo(null)} />}
      {activeSeason && <HistoryChapter
        season={activeSeason}
        video={seasonVideos.find((video) => seasonNumber(video) === activeSeason.number)}
        onPlay={(video) => { setActiveSeason(null); setActiveVideo(video); }}
        onClose={() => setActiveSeason(null)}
      />}
    </>
  );
}
