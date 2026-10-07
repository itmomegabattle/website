import { Api } from "../../api";

export default function HistoryOrigin({ origin }) {
  if (!origin) return null;
  const image = Api.normalizeURL(origin.image);
  const archiveImage = Api.normalizeURL(origin.archiveImage);

  return (
    <section className="history-origin" id="origin">
      <div className="history-origin__copy">
        <h2>{origin.title}</h2>
        <p className="history-origin__lead">{origin.lead}</p>
        <p>{origin.text}</p>
        <blockquote>{origin.note}</blockquote>
      </div>
      <div className="history-origin__media">
        <figure
          className="history-origin__photo history-origin__photo--main"
          style={{ "--history-image": `url("${image}")` }}
        >
          <img src={image} alt="Общий снимок финала «Весны в ИТМО»" width="1600" height="1067" loading="lazy" />
          <figcaption>Финал «Весны в ИТМО» · 2018</figcaption>
        </figure>
        <figure
          className="history-origin__photo history-origin__photo--archive"
          style={{ "--history-image": `url("${archiveImage}")` }}
        >
          <img src={archiveImage} alt="Архивный кадр фестиваля «Весна в ИТМО»" width="1200" height="800" loading="lazy" />
          <figcaption>«Весна в ИТМО» · 2015</figcaption>
        </figure>
        <span className="history-origin__stamp">ДО<br />MEGA<br />BATTLE</span>
      </div>
    </section>
  );
}
