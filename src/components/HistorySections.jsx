import { useQuery } from "@tanstack/react-query";
import { Api } from "../api";

export function ProjectTimeline() {
  const history = useQuery({
    queryKey: ["history"],
    queryFn: Api.getHistory,
    initialData: { timeline: [], archive: [] },
  }).data;

  return (
    <div className="timeline">
      {history.timeline.map((item) => (
        <article className="timeline-item" key={item.title}>
          <span>{item.year}</span>
          <div className="info-card">
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

export function ArchiveCards() {
  const history = useQuery({
    queryKey: ["history"],
    queryFn: Api.getHistory,
    initialData: { timeline: [], archive: [] },
  }).data;

  return (
    <div className="feature-grid">
      {history.archive.map((item) => (
        <article className="info-card" key={item.title}>
          <h2>{item.title}</h2>
          <p>{item.text}</p>
          <a className="text-button" href="#">
            {item.action}
          </a>
        </article>
      ))}
    </div>
  );
}
