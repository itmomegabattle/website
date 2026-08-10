import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Api } from "../api";
import { getMemberCardImage } from "./team/memberImages";

const fallbackAvatar = "/images/people/member-full.jpg";
const INITIAL_PEOPLE_COUNT = 24;
const PEOPLE_BATCH_SIZE = 24;

function nameTokens(name) {
  return String(name || "")
    .toLocaleLowerCase("ru")
    .replaceAll("ё", "е")
    .replace(/[^a-zа-я\s-]/gi, " ")
    .split(/[\s-]+/)
    .filter(Boolean);
}

function belongsToCurrentTeam(name, currentPeople) {
  const candidate = nameTokens(name);
  if (candidate.length < 2) return false;
  return currentPeople.some((person) => {
    const current = new Set(nameTokens(person.name));
    return candidate.every((token) => current.has(token));
  });
}

function cleanPeople(organizers, responsible, contributors) {
  const excludedNames = new Set(["саша тванкова", "александра тванкова", "aleksandra tvankova", "инга", "даша рудкина"]);
  const currentPeople = [
    ...organizers,
    ...responsible,
  ];
  const allPeople = contributors.filter((person) => {
    if (!person.name || person.name.trim().toLowerCase() === "имя фамилия") return false;
    const normalizedName = person.name.trim().toLocaleLowerCase("ru");
    if (excludedNames.has(normalizedName) || /(^|\s)инга(\s|$)/i.test(normalizedName)) return false;
    return !belongsToCurrentTeam(person.name, currentPeople);
  });

  return Array.from(
    new Map(allPeople.map((person) => [person.name.trim().toLocaleLowerCase("ru"), person])).values(),
  );
}

export default function PeopleCloud() {
  const [visibleCount, setVisibleCount] = useState(INITIAL_PEOPLE_COUNT);
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
    queryFn: Api.getContributors,
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
    <section className="people-cloud-section" aria-labelledby="people-cloud-title">
      <header className="people-section-heading people-cloud-heading">
        <div>
          <h2 id="people-cloud-title">ПЛЕЯДА</h2>
        </div>
      </header>

      <div className="people-cloud" aria-label="Люди проекта">
        {bubbles.slice(0, visibleCount).map((person, index) => (
          <article className="people-cloud-person" key={person.bubbleKey} tabIndex="0">
            <img
              src={Api.normalizeURL(getMemberCardImage(person) || fallbackAvatar)}
              alt=""
              width="256"
              height="256"
              loading={index < 8 ? "eager" : "lazy"}
              decoding="async"
            />
            <span>
              <strong>{person.name}</strong>
            </span>
          </article>
        ))}
      </div>
      {visibleCount < bubbles.length && (
        <div className="people-cloud-more">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => Math.min(count + PEOPLE_BATCH_SIZE, bubbles.length))}
          >
            Показать ещё
            <span>+{Math.min(PEOPLE_BATCH_SIZE, bubbles.length - visibleCount)}</span>
          </button>
        </div>
      )}
    </section>
  );
}
