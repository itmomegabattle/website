import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Api } from "../../api";

function FacultyLogo({ faculty, className = "" }) {
  if (faculty.logo) {
    return (
      <img
        className={`faculty-explorer-logo faculty-explorer-logo--${faculty.id} ${className}`.trim()}
        src={Api.normalizeURL(faculty.logo)}
        alt={`Логотип ${faculty.name}`}
      />
    );
  }

  return (
    <span
      className={`faculty-explorer-logo faculty-explorer-logo--parts faculty-explorer-logo--${faculty.id} ${className}`.trim()}
      aria-label={`Логотип ${faculty.name}`}
    >
      {faculty.logoParts?.map((part) => (
        <img src={Api.normalizeURL(part)} alt="" aria-hidden="true" key={part} />
      ))}
    </span>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M14 7l5 5-5 5" />
    </svg>
  );
}

const RETRO_PRESENTATIONS = {
  ktu: {
    layout: "systems",
    issue: "Systems edition",
    ribbon: ["системы", "инженерия", "код", "сцена", "архив"],
    footer: "Технологии · команда · сезон",
    labels: {
      feature: "Главная схема",
      brief: "Техническое резюме",
      people: "Команда разработки",
      quote: "Принцип",
      list: "Контур проекта",
      season: "Журнал запуска",
    },
  },
  tint: {
    layout: "signal",
    issue: "Digital culture issue",
    ribbon: ["медиа", "данные", "дизайн", "сигнал", "эфир"],
    footer: "Медиа · данные · цифровая культура",
    labels: {
      feature: "Сигнал номера",
      brief: "В двух строках",
      people: "Лица в эфире",
      quote: "Манифест",
      list: "В сетке",
      season: "Лента сезона",
    },
  },
  nozh: {
    layout: "lab",
    issue: "Living systems review",
    ribbon: ["био", "химия", "среда", "эксперимент", "жизнь"],
    footer: "Наука · жизнь · эксперимент",
    labels: {
      feature: "Исследование выпуска",
      brief: "Аннотация",
      people: "Исследовательская группа",
      quote: "Гипотеза",
      list: "Области опыта",
      season: "Полевой журнал",
    },
  },
  ftmf: {
    layout: "spectrum",
    issue: "Spectrum journal",
    ribbon: ["свет", "физика", "фотоника", "сцена", "спектр"],
    footer: "Свет · материя · движение",
    labels: {
      feature: "Тема спектра",
      brief: "Фокус",
      people: "Люди света",
      quote: "Импульс",
      list: "Длины волн",
      season: "Спектр сезона",
    },
  },
  ftmi: {
    layout: "strategy",
    issue: "Management review",
    ribbon: ["бизнес", "аналитика", "идеи", "команда", "рост"],
    footer: "Решения · люди · развитие",
    labels: {
      feature: "Разбор номера",
      brief: "Executive summary",
      people: "Лица решения",
      quote: "Позиция",
      list: "Точки роста",
      season: "Хроника решений",
    },
  },
};

function getDepartmentLabel(department) {
  return typeof department === "string" ? department : department.name;
}

function getDepartmentSearchText(department) {
  if (typeof department === "string") {
    return department;
  }

  return [
    department.name,
    department.short,
    ...(department.aliases ?? []),
    department.kind,
    department.isuId,
    ...(department.programs ?? []).flatMap((program) => [
      program.name,
      program.short,
      ...(program.aliases ?? []),
      program.level,
      ...(program.directions ?? []).flatMap((direction) => [
        direction.code,
        direction.name,
        ...(direction.aliases ?? []),
      ]),
    ]),
    ...(department.projects ?? []).flatMap((project) => [
      project.name,
      project.type,
      ...(project.aliases ?? []),
    ]),
  ]
    .filter(Boolean)
    .join(" ");
}

function getUnitCountLabel(count, unitType = "faculties") {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;
  const words = {
    directions: ["направление", "направления", "направлений"],
    units: ["подразделение", "подразделения", "подразделений"],
    faculties: ["факультет", "факультета", "факультетов"],
  }[unitType] ?? ["подразделение", "подразделения", "подразделений"];

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${String(count).padStart(2, "0")} ${words[2]}`;
  }

  if (lastDigit === 1) {
    return `${String(count).padStart(2, "0")} ${words[0]}`;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${String(count).padStart(2, "0")} ${words[1]}`;
  }

  return `${String(count).padStart(2, "0")} ${words[2]}`;
}

function normalizeSearchValue(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("ru")
    .replaceAll("ё", "е")
    .replace(/[–—/(),.:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSearchScore(query, primaryValues, aliases = []) {
  const normalizedQuery = normalizeSearchValue(query);
  const primary = primaryValues.map(normalizeSearchValue).filter(Boolean);
  const aliasValues = aliases.map(normalizeSearchValue).filter(Boolean);
  const allValues = [...aliasValues, ...primary];
  if (!normalizedQuery) return 0;

  if (aliasValues.includes(normalizedQuery)) return 1200;
  if (primary.includes(normalizedQuery)) return 1100;
  if (allValues.some((value) => value.split(" ").includes(normalizedQuery))) return 900;
  if (allValues.some((value) => value.startsWith(normalizedQuery))) return 650;
  if (normalizedQuery.length >= 3 && allValues.some((value) => value.includes(normalizedQuery))) return 400;
  return 0;
}

function buildSearchResults(faculties, query) {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return [];
  }

  return faculties
    .flatMap((faculty) => {
      const facultyPrimary = [
        faculty.name,
        faculty.title,
        faculty.tag,
        faculty.short,
        faculty.description,
      ];
      const results = [];
      const facultyScore = getSearchScore(normalizedQuery, facultyPrimary, faculty.aliases ?? []);

      if (facultyScore) {
        results.push({
          id: `${faculty.id}-megafaculty`,
          faculty,
          eyebrow: "Мегафакультет",
          label: faculty.name,
          detail: faculty.title,
          score: facultyScore + 10,
        });
      }

      (faculty.departments ?? []).forEach((department) => {
        const departmentLabel = getDepartmentLabel(department);
        const isDirection = faculty.unitType === "directions";
        const departmentScore = getSearchScore(normalizedQuery, [
          department.name,
          department.short,
          department.kind,
          department.isuId,
        ], department.aliases ?? []);

        if (departmentScore) {
          results.push({
            id: `${faculty.id}-${department.isuId ?? departmentLabel}`,
            faculty,
            eyebrow: `${isDirection ? "Направление" : department.kind ?? "Подразделение"} · ${faculty.name}`,
            label: departmentLabel,
            detail: `${isDirection ? "Входит" : "Относится"} в ${faculty.name}`,
            score: departmentScore + 20,
          });
        }

        department.programs?.forEach((program, programIndex) => {
          const programScore = getSearchScore(normalizedQuery, [
            program.name,
            program.short,
            program.level,
          ], program.aliases ?? []);

          if (programScore) {
            results.push({
              id: `${faculty.id}-${department.isuId ?? departmentLabel}-program-${programIndex}`,
              faculty,
              eyebrow: `Программа · ${faculty.name}`,
              label: program.name,
              detail: `${department.short ?? department.name} · ${program.level ?? "Образовательная программа"}`,
              score: programScore + 40,
            });
          }

          program.directions?.forEach((direction, directionIndex) => {
            const directionScore = getSearchScore(normalizedQuery, [
              direction.code,
              direction.name,
            ], direction.aliases ?? []);

            if (directionScore) {
              results.push({
                id: `${faculty.id}-${department.isuId ?? departmentLabel}-direction-${programIndex}-${directionIndex}`,
                faculty,
                eyebrow: `Направление подготовки · ${faculty.name}`,
                label: direction.name,
                detail: `${direction.code} · программа «${program.name}»`,
                score: directionScore + 50,
              });
            }
          });
        });

        department.projects?.forEach((project, projectIndex) => {
          const projectScore = getSearchScore(normalizedQuery, [
            project.name,
            project.type,
          ], project.aliases ?? []);

          if (projectScore) {
            results.push({
              id: `${faculty.id}-${department.isuId ?? departmentLabel}-project-${projectIndex}`,
              faculty,
              eyebrow: `Проект · ${faculty.name}`,
              label: project.name,
              detail: `${department.short ?? department.name} · не отдельное направление`,
              score: projectScore + 30,
            });
          }
        });
      });

      return results;
    })
    .sort((left, right) => right.score - left.score || left.label.localeCompare(right.label, "ru"))
    .slice(0, 10);
}

export default function FacultyExplorer() {
  const faculties = useQuery({
    queryKey: ["faculties"],
    queryFn: Api.getFaculties,
    placeholderData: [],
  }).data;
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedFaculty = searchParams.get("faculty");
  const [activeId, setActiveId] = useState(requestedFaculty || "ktu");
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const activeFaculty = useMemo(
    () => faculties.find((faculty) => faculty.id === activeId) ?? faculties[0] ?? null,
    [faculties, activeId],
  );
  const searchResults = useMemo(
    () => buildSearchResults(faculties, query),
    [faculties, query],
  );
  const activeUnitType = activeFaculty?.unitType ?? "faculties";
  const activeUnitTitle =
    activeUnitType === "directions"
      ? `Направления ${activeFaculty?.name ?? ""}`
      : activeUnitType === "units"
        ? `Структура и программы ${activeFaculty?.name ?? ""}`
        : `Факультеты ${activeFaculty?.name ?? ""}`;

  useEffect(() => {
    if (requestedFaculty && faculties.some((faculty) => faculty.id === requestedFaculty)) {
      setActiveId(requestedFaculty);
    }
  }, [faculties, requestedFaculty]);

  const selectFaculty = (faculty, clearSearch = false) => {
    setActiveId(faculty.id);
    setSearchParams({ faculty: faculty.id }, { replace: true });
    setIsSearchOpen(false);

    if (clearSearch) {
      setQuery("");
    }
  };

  if (!activeFaculty) {
    return (
      <div className="faculty-explorer-loading" aria-live="polite">
        Собираем факультеты…
      </div>
    );
  }

  const retrospectiveSections = [
    {
      ...activeFaculty.history,
      eyebrow: "Архив мегафака",
    },
    ...(activeFaculty.history.sections ?? [
      {
        eyebrow: "Люди мегафака",
        title: `${activeFaculty.name}: команда за кадром`,
        text: "Продолжение этой истории всегда пишут люди. За каждым выходом на сцену стоят сборы, ночные обсуждения, распределение ролей и десятки маленьких решений, из которых постепенно складывается общий характер команды.",
        image: "/images/events/event2.jpg",
      },
      {
        eyebrow: "Внутри сезона",
        title: `${activeFaculty.name}: от первой идеи до финала`,
        text: "Так команда проходит сезон: начинает с почти пустого листа, собирает собственные образы и шутки, а к финалу оставляет моменты, которые вспоминают ещё долго. Здесь позднее можно продолжить рассказ конкретными историями, фотографиями и голосами участников.",
        image: "/images/about-image.png",
      },
    ]),
  ];
  const retrospectivePeople = retrospectiveSections[1];
  const retrospectiveSeason = retrospectiveSections[2];
  const retrospectiveTags = activeFaculty.megabattle ?? [];
  const retroPresentation =
    RETRO_PRESENTATIONS[activeFaculty.id] ?? RETRO_PRESENTATIONS.ktu;

  return (
    <div className="faculty-explorer">
      <div className="faculty-search-zone">
        <label className="faculty-search" htmlFor="faculty-search-input">
          <SearchIcon />
          <input
            id="faculty-search-input"
            type="search"
            value={query}
            placeholder="Найди мегафак, подразделение, программу или направление"
            aria-label="Поиск по структуре мегафакультетов"
            autoComplete="off"
            onChange={(event) => {
              setQuery(event.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setIsSearchOpen(false);
              }

              if (event.key === "Enter" && searchResults[0]) {
                event.preventDefault();
                selectFaculty(searchResults[0].faculty);
              }
            }}
          />
          {query ? (
            <button
              type="button"
              className="faculty-search-clear"
              aria-label="Очистить поиск"
              onClick={() => {
                setQuery("");
                setIsSearchOpen(false);
              }}
            >
              ×
            </button>
          ) : (
            <span className="faculty-search-hint">СППО, ИВТ, ИИИ…</span>
          )}
        </label>

        {isSearchOpen && query.trim() ? (
          <div className="faculty-search-results" role="listbox">
            {searchResults.length ? (
              searchResults.map((result) => (
                <button
                  type="button"
                  className="faculty-search-result"
                  role="option"
                  key={result.id}
                  onClick={() => selectFaculty(result.faculty)}
                >
                  <span>
                    <small>{result.eyebrow}</small>
                    <strong>{result.label}</strong>
                    <em>{result.detail}</em>
                  </span>
                  <ArrowIcon />
                </button>
              ))
            ) : (
              <p className="faculty-search-empty">
                Ничего не найдено. Попробуй название программы, код направления,
                сокращение или ИСУ-ID.
              </p>
            )}
          </div>
        ) : null}
      </div>

      <div className="faculty-switcher" aria-label="Выбор мегафакультета">
        {faculties.map((faculty, index) => {
          const isActive = faculty.id === activeFaculty.id;

          return (
            <button
              type="button"
              className={`faculty-switcher-item${isActive ? " is-active" : ""}`}
              key={faculty.id}
              aria-pressed={isActive}
              onClick={() => selectFaculty(faculty, true)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{faculty.name}</strong>
              <small>{faculty.tag.split(" · ").slice(0, 2).join(" · ")}</small>
            </button>
          );
        })}
      </div>

      <div className="faculty-dynamic-page" key={activeFaculty.id}>
        <section className="faculty-identity">
          <div className="faculty-identity-logo">
            <FacultyLogo faculty={activeFaculty} />
          </div>
          <div className="faculty-identity-copy">
            <p className="faculty-section-index">Выбран мегафак · {activeFaculty.name}</p>
            <h2>{activeFaculty.title}</h2>
            <p className="faculty-identity-lead">{activeFaculty.description}</p>
            <div className="faculty-identity-actions">
              <a
                className="faculty-source-link"
                href={activeFaculty.source}
                target="_blank"
                rel="noreferrer"
              >
                Программы на сайте ИТМО
                <ArrowIcon />
              </a>
              <a
                className="faculty-source-link"
                href={activeFaculty.telegram ?? "https://t.me/itmomegabattle"}
                target="_blank"
                rel="noreferrer"
              >
                Telegram мегафака
                <ArrowIcon />
              </a>
              <a
                className="faculty-source-link"
                href={activeFaculty.responsibleContact ?? "https://t.me/Arshinovoleg"}
                target="_blank"
                rel="noreferrer"
              >
                Контакт мегаответственной
                <ArrowIcon />
              </a>
            </div>
          </div>
        </section>

        <section className={`faculty-programs faculty-programs--${activeFaculty.id}`}>
          <header className="faculty-section-head">
            <div>
              <p className="faculty-section-index">
                {getUnitCountLabel(activeFaculty.departments.length, activeUnitType)}
              </p>
              <h2>{activeUnitTitle}</h2>
            </div>
            {activeUnitType === "directions" ? (
              <p>
                ФТМИ — отдельный мегафакультет. Здесь собраны его основные
                образовательные направления без подмены ФТМИ одним из факультетов.
              </p>
            ) : (
              <p>{activeFaculty.structureNote ?? "Структура сверена с ИСУ ИТМО."}</p>
            )}
          </header>

          <div className="faculty-program-grid">
            {activeFaculty.departments.map((department, index) => (
              <article
                className={`faculty-program-card${
                  (department.programs?.length ?? 0) >= 3 ? " is-wide" : ""
                }`}
                key={department.isuId ?? getDepartmentLabel(department)}
              >
                <span>
                  {String(index + 1).padStart(2, "0")}
                  {department.kind ? ` · ${department.kind}` : ""}
                  {department.isuId ? ` · ИСУ ${department.isuId}` : ""}
                </span>
                <h3>
                  {department.short ? <small>{department.short}</small> : null}
                  {getDepartmentLabel(department)}
                </h3>
                {department.programs?.length ? (
                  <div className="faculty-program-list">
                    {department.programs.map((program) => (
                      <article
                        className="faculty-degree"
                        key={`${department.isuId ?? department.name}-${program.name}`}
                      >
                        <div className="faculty-degree-head">
                          <span>{program.level ?? "Программа"}</span>
                          {program.short ? <b>{program.short}</b> : null}
                        </div>
                        <h4>{program.name}</h4>
                        <div className="faculty-direction-list">
                          {program.directions?.map((direction) => (
                            <p key={`${direction.code}-${direction.name}`}>
                              <code>{direction.code}</code>
                              <span>{direction.name}</span>
                            </p>
                          ))}
                        </div>
                        {program.url ? (
                          <a href={program.url} target="_blank" rel="noreferrer">
                            Страница программы
                            <ArrowIcon />
                          </a>
                        ) : null}
                      </article>
                    ))}
                  </div>
                ) : null}
                {department.projects?.length ? (
                  <div className="faculty-projects">
                    <strong>Проекты подразделения</strong>
                    <div>
                      {department.projects.map((project) => (
                        <span key={project.name}>
                          {project.name}
                          <small>{project.type}</small>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="faculty-retro-section">
          <h2 className="faculty-retro-title">РЕТРО</h2>
          <div
            className={`faculty-retro-newspaper faculty-retro-newspaper--${retroPresentation.layout}`}
          >
            <header className="faculty-retro-masthead">
              <span>Архив сезона</span>
              <strong>{activeFaculty.name}</strong>
              <span>{retroPresentation.issue}</span>
            </header>
            <div className="faculty-retro-ribbon" aria-hidden="true">
              {retroPresentation.ribbon.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <div className="faculty-retro-sequence">
              <article className="faculty-retrospective is-featured">
                <div className="faculty-retrospective-copy">
                  <small>{retroPresentation.labels.feature}</small>
                  <p>
                    <strong>{retrospectiveSections[0].title}</strong>
                  </p>
                </div>
                <div className="faculty-retrospective-feature-media">
                  <div className="faculty-retrospective-image">
                    <img
                      src={Api.normalizeURL(retrospectiveSections[0].image)}
                      alt=""
                    />
                  </div>
                  <p>{retrospectiveSections[0].text}</p>
                </div>
              </article>

              <article className="faculty-retro-cell is-brief">
                <small>{retroPresentation.labels.brief}</small>
                <h3>{activeFaculty.short}</h3>
                <p>{activeFaculty.description}</p>
              </article>

              <article className="faculty-retro-cell is-photo-story">
                <div className="faculty-retrospective-image">
                  <img src={Api.normalizeURL(retrospectivePeople.image)} alt="" />
                </div>
                <small>{retroPresentation.labels.people}</small>
                <h3>{retrospectivePeople.title}</h3>
              </article>

              <article className="faculty-retro-cell is-pullquote">
                <small>{retroPresentation.labels.quote}</small>
                <blockquote>«{activeFaculty.vibe}»</blockquote>
              </article>

              <article className="faculty-retro-cell is-list">
                <small>{retroPresentation.labels.list}</small>
                <h3>Что создаёт {activeFaculty.name}</h3>
                <ul>
                  {retrospectiveTags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </article>

              <article className="faculty-retro-cell is-note">
                <small>{retroPresentation.labels.season}</small>
                <h3>{retrospectiveSeason.title}</h3>
                <p>{retrospectiveSeason.text}</p>
              </article>

              <article className="faculty-retro-cell is-small-photo">
                <div className="faculty-retrospective-image">
                  <img src={Api.normalizeURL(retrospectiveSeason.image)} alt="" />
                </div>
                <p>Архивный кадр · {activeFaculty.name}</p>
              </article>

              <article className="faculty-retro-cell is-editor-note">
                <small>Справка редакции</small>
                <p>
                  {activeFaculty.structureNote ??
                    "Структура мегафака меняется и растёт вместе с образовательными программами и людьми."}
                </p>
              </article>
            </div>
            <footer className="faculty-retro-footer" aria-hidden="true">
              <span>ITMO Megabattle</span>
              <span>{retroPresentation.footer}</span>
            </footer>
          </div>
        </section>
      </div>
    </div>
  );
}
