import { useQuery } from "@tanstack/react-query";
import { Api } from "../api";

export function ExternalPrCards() {
  const data = useQuery({
    queryKey: ["external-pr"],
    queryFn: Api.getExternalPr,
    initialData: { items: [], contact: null },
  }).data;

  return (
    <div className="feature-grid">
      {data.items.map((item) => (
        <article className="info-card" key={item.title}>
          <h2>{item.title}</h2>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  );
}

export function ExternalPrContact() {
  const data = useQuery({
    queryKey: ["external-pr"],
    queryFn: Api.getExternalPr,
    initialData: { items: [], contact: null },
  }).data;

  if (!data.contact) {
    return null;
  }

  return (
    <article className="info-card contact-cta">
      <p className="card-kicker">{data.contact.kicker}</p>
      <h2>{data.contact.title}</h2>
      <p>{data.contact.text}</p>
    </article>
  );
}
