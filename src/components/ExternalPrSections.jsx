import { useQuery } from "@tanstack/react-query";
import { Api } from "../api";

export function ExternalPrCards() {
  const data = useQuery({
    queryKey: ["external-pr"],
    queryFn: Api.getExternalPr,
    placeholderData: { items: [], contact: null },
  }).data;

  return (
    <div className="partnership-formats">
      {data.items.map((item, index) => (
        <article className="partnership-format-card" key={item.title}>
          <span className="partnership-format-index">{String(index + 1).padStart(2, "0")}</span>
          <div>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

export function ExternalPrContact() {
  const data = useQuery({
    queryKey: ["external-pr"],
    queryFn: Api.getExternalPr,
    placeholderData: { items: [], contact: null },
  }).data;

  if (!data.contact) {
    return null;
  }

  const contacts = data.contact.links?.length
    ? data.contact.links
    : [{ label: data.contact.title, href: `mailto:${data.contact.title}` }];

  return (
    <article className="partnership-contact">
      <div className="partnership-contact-copy">
        <p className="card-kicker">{data.contact.kicker}</p>
        <h2>{data.contact.heading || "Давайте сделаем что-то вместе"}</h2>
        <p>{data.contact.text}</p>
      </div>
      <div className="partnership-contact-links">
        {contacts.map((contact) => (
          <a href={contact.href} key={`${contact.label}-${contact.href}`}>
            <span>{contact.label}</span>
            <span aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
    </article>
  );
}
