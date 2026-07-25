import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis, faLink, faShareNodes, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { ProjectAvatar, SocialScreen } from "./ContactPrimitives";
import { EVENT_STORIES, FALLBACK_STATS, formatSocialStat as stat } from "./contactData";

export function InstagramProfile({ data, href }) {
  return (
    <SocialScreen className="instagram-screen" href={href}>
      <div className="instagram-screen__top"><span>‹</span><strong>itmo.megabattle</strong><FontAwesomeIcon icon={faEllipsis} /></div>
      <div className="instagram-screen__center">
        <div className="instagram-screen__profile">
          <ProjectAvatar />
          <div className="instagram-screen__stats">
            <span><strong>{stat(data.posts)}</strong>публикации</span>
            <span><strong>{stat(data.followers, true)}</strong>подписчики</span>
            <span><strong>{stat(data.following)}</strong>подписки</span>
          </div>
        </div>
        <div className="instagram-screen__bio">
          <strong>ITMO Megabattle</strong>
          <span>Major events by the makers at ITMO</span>
          <a href={href} target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faLink} /> mblinks.online</a>
        </div>
        <div className="instagram-screen__actions">
          <a href={href} target="_blank" rel="noreferrer">Подписаться</a>
          <a href={href} target="_blank" rel="noreferrer">Сообщение</a>
          <a href={href} target="_blank" rel="noreferrer" aria-label="Открыть Instagram"><FontAwesomeIcon icon={faUserPlus} /></a>
        </div>
        <div className="instagram-screen__stories" aria-label="Архивные истории">
          {EVENT_STORIES.map((story) => (
            <span key={story.title}>
              <img src={story.image} alt="" loading="lazy" />
              <small>{story.title}</small>
            </span>
          ))}
        </div>
      </div>
    </SocialScreen>
  );
}

export function TiktokProfile({ data, href }) {
  return (
    <SocialScreen className="tiktok-screen" href={href}>
      <ProjectAvatar />
      <div className="tiktok-screen__content">
        <div className="tiktok-screen__title"><strong>ITMO MEGABATTLE</strong><span>|</span><span>itmo_megabattle</span></div>
        <div className="tiktok-screen__stats">
          <span><strong>{stat(data.posts)}</strong> Публикации</span>
          <span><strong>{stat(data.followers)}</strong> Подписчики</span>
          <span><strong>{stat(data.likes)}</strong> Лайки</span>
        </div>
        <div className="tiktok-screen__actions">
          <a href={href} target="_blank" rel="noreferrer">Подписаться</a>
          <a href={href} target="_blank" rel="noreferrer">Сообщение</a>
          <a href={href} target="_blank" rel="noreferrer" aria-label="Добавить в TikTok"><FontAwesomeIcon icon={faUserPlus} /></a>
          <a href={href} target="_blank" rel="noreferrer" aria-label="Поделиться TikTok"><FontAwesomeIcon icon={faShareNodes} /></a>
          <a href={href} target="_blank" rel="noreferrer" aria-label="Открыть TikTok"><FontAwesomeIcon icon={faEllipsis} /></a>
        </div>
        <p>Major events by the makers at ITMO</p>
        <a className="tiktok-screen__link" href={href} target="_blank" rel="noreferrer">mblinks.online</a>
      </div>
    </SocialScreen>
  );
}

export function RutubeProfile({ data, href }) {
  const videos = (data.videos || []).slice(0, 3);
  const cover = data.cover || FALLBACK_STATS.rutube.cover;

  return (
    <SocialScreen className="rutube-screen" href={href}>
      <div className="rutube-screen__top">
        <strong>RUTUBE</strong><span>Поиск</span><FontAwesomeIcon icon={faEllipsis} />
      </div>
      <div className="rutube-screen__hero">
        <img src={cover} alt="" loading="lazy" />
        <div className="rutube-screen__profile">
          <ProjectAvatar />
          <div><strong>ITMO MEGABATTLE</strong><span>{stat(data.followers)} подписчиков</span></div>
        </div>
      </div>
      <div className="rutube-screen__channel-nav">
        <strong>Главная</strong><span>Видео</span><span>Shorts</span><span>Плейлисты</span>
      </div>
      <div className="rutube-screen__feed">
        <div className="rutube-screen__feed-title"><span>ITMO Megabattle нельзя описать. Его можно почувствовать!</span><strong>Видео ›</strong></div>
        <div className="rutube-screen__videos">
          {videos.map((video, index) => (
            <a href={video.url || href} target="_blank" rel="noreferrer" key={`${video.url}-${index}`}>
              <span className="rutube-screen__thumbnail">
                <img src={video.thumbnail} alt="" loading="lazy" />
                <i>▶</i>
              </span>
              <strong>{video.title}</strong>
            </a>
          ))}
        </div>
      </div>
    </SocialScreen>
  );
}
