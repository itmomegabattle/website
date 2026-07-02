import { useQuery } from "@tanstack/react-query";
import { Api } from "../api";

export default function FacultyHistory() {
  const faculties = useQuery({
    queryKey: ["faculties"],
    queryFn: Api.getFaculties,
    initialData: [],
  }).data;

  return (
    <div className="faculty-history-list">
      {faculties.map((faculty) => (
        <article
          className="faculty-history-card"
          key={faculty.id}
          style={{ "--faculty-card-color": faculty.color }}
        >
          <div className="faculty-history-image">
            <img
              src={Api.normalizeURL(faculty.history.image)}
              alt={faculty.history.title}
            />
          </div>
          <div className="faculty-history-content">
            <p className="card-kicker">{faculty.name}</p>
            <h2>{faculty.history.title}</h2>
            <p>{faculty.history.text}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
