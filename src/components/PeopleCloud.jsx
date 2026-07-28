import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Api } from "../api";
import { getPublishedTeamMembers } from "../services/teamService";
import { getMemberCardImage } from "./team/memberImages";

const fallbackAvatar = "/images/people/member-full.jpg";

function cleanPeople(organizers, responsible, contributors) {
  const currentPeople = [
    ...organizers.map((person) => ({ ...person, teamLabel: "Организатор" })),
    ...responsible.map((person) => ({ ...person, teamLabel: "Ответственный" })),
  ];
  const allPeople = [
    ...currentPeople,
    ...contributors.map((person) => ({ ...person, teamLabel: person.activity || "Команда Megabattle" })),
  ].filter((person) => person.name && person.name.trim().toLowerCase() !== "имя фамилия");

  return Array.from(
    new Map(allPeople.map((person) => [person.name.trim().toLocaleLowerCase("ru"), person])).values(),
  );
}

export default function PeopleCloud() {
  const organizers = useQuery({
    queryKey: ["organizers"],
    queryFn: Api.getOrganizers,
    placeholderData: [],
  }).data;
  const responsible = useQuery({
    queryKey: ["responsible"],
    queryFn: Api.getResponsible,
    placeholderData: [],
  }).data;
  const contributors = useQuery({
    queryKey: ["contributors"],
    queryFn: () => getPublishedTeamMembers("contributors", []),
    placeholderData: [],
  }).data;

  const bubbles = useMemo(() => {
    const people = cleanPeople(organizers, responsible, contributors);
    return people.map((person, index) => ({
      ...person,
      bubbleKey: `${person.key || person.id || person.name}-${index}`,
    }));
  }, [organizers, responsible, contributors]);

  if (!bubbles.length) return null;

  return (
    <section className="people-cloud-section main-width" aria-labelledby="people-cloud-title">
      <header className="people-section-heading people-cloud-heading">
        <div>
          <h2 id="people-cloud-title">КТО НАД ЭТИМ<br />ТРУДИЛСЯ</h2>
        </div>
        <p>
          Организаторы и ответственные разных сезонов. Наведи на человека,
          чтобы увидеть имя и роль в проекте.
        </p>
      </header>

      <div className="people-cloud">
        {bubbles.map((person, index) => {
          const row = Math.floor(index / 9);
          return (
            <article
              className="people-cloud-person"
              key={person.bubbleKey}
              tabIndex="0"
              style={{
                "--cloud-column": index % 9,
                "--cloud-row": row,
                "--cloud-offset": row % 2,
                "--cloud-mobile-column": index % 5,
                "--cloud-mobile-row": Math.floor(index / 5),
                "--cloud-mobile-offset": Math.floor(index / 5) % 2,
                "--cloud-shift-x": `${(((index * 17) % 5) - 2) * 0.18}rem`,
                "--cloud-shift-y": `${(((index * 23) % 5) - 2) * 0.24}rem`,
                "--cloud-tilt": `${(((index * 13) % 7) - 3) * 0.85}deg`,
              }}
            >
              <img
                src={Api.normalizeURL(getMemberCardImage(person) || fallbackAvatar)}
                alt=""
                width="256"
                height="256"
                loading="eager"
                decoding="async"
              />
              <span>
                <strong>{person.name}</strong>
                <small>{person.role || person.activity || person.teamLabel}</small>
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
}
