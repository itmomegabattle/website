import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Api } from "../../api";

function FacultyLogo({ faculty, className = "" }) {
  if (faculty.logo) {
    return (
      <img
        className={`faculty-explorer-logo ${className}`.trim()}
        src={Api.normalizeURL(faculty.logo)}
        alt={`Логотип ${faculty.name}`}
      />
    );
  }

  return (
    <span
      className={`faculty-explorer-logo faculty-explorer-logo--parts ${className}`.trim()}
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

function buildSearchResults(faculties, query) {
  const normalizedQuery = query.trim().toLocaleLowerCase("ru");

  if (!normalizedQuery) {
    return [];
  }

  return faculties
    .flatMap((faculty) => {
      const facultyText = [
        faculty.name,
        faculty.title,
        faculty.tag,
        faculty.short,
        faculty.description,
      ]
        .join(" ")
        .toLocaleLowerCase("ru");

      const results = [];

      if (facultyText.includes(normalizedQuery)) {
        results.push({
          id: `${faculty.id}-megafaculty`,
          faculty,
          eyebrow: "Мегафакультет",
          label: faculty.name,
          detail: faculty.title,
        });
      }

      faculty.departments.forEach((department) => {
        if (department.toLocaleLowerCase("ru").includes(normalizedQuery)) {
          results.push({
            id: `${faculty.id}-${department}`,
            faculty,
            eyebrow: faculty.name,
            label: department,
            detail: `Относится к ${faculty.name}`,
          });
        }
      });

      return results;
    })
    .slice(0, 8);
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

  return (
    <div className="faculty-explorer">
      <div className="faculty-search-zone">
        <label className="faculty-search" htmlFor="faculty-search-input">
          <SearchIcon />
          <input
            id="faculty-search-input"
            type="search"
            value={query}
            placeholder="Найди факультет или направление"
            aria-label="Поиск факультета или направления"
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
            <span className="faculty-search-hint">КТУ, БИ, биотех…</span>
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
                Ничего не нашли. Попробуй название факультета или сокращение.
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
            <a
              className="faculty-source-link"
              href={activeFaculty.source}
              target="_blank"
              rel="noreferrer"
            >
              Программы на сайте ИТМО
              <ArrowIcon />
            </a>
          </div>
        </section>

        <section className="faculty-programs">
          <header className="faculty-section-head">
            <div>
              <p className="faculty-section-index">
                {String(activeFaculty.departments.length).padStart(2, "0")} направлений
              </p>
              <h2>Что входит в {activeFaculty.name}</h2>
            </div>
            <p>
              Нажми на мегафак выше или найди конкретное направление через поиск —
              остальная страница перестроится автоматически.
            </p>
          </header>

          <div className="faculty-program-grid">
            {activeFaculty.departments.map((department, index) => (
              <article className="faculty-program-card" key={department}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{department}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="faculty-bento">
          <article className="faculty-bento-card faculty-bento-card--vibe">
            <p className="faculty-section-index">Характер</p>
            <h2>{activeFaculty.vibe}</h2>
          </article>

          <article className="faculty-bento-card faculty-bento-card--roles">
            <p className="faculty-section-index">В Megabattle</p>
            <div className="faculty-role-list">
              {activeFaculty.megabattle.map((role, index) => (
                <span key={role}>
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  {role}
                </span>
              ))}
            </div>
          </article>
        </section>

        <section className="faculty-retrospective">
          <div className="faculty-retrospective-image">
            <img
              src={Api.normalizeURL(activeFaculty.history.image)}
              alt={activeFaculty.history.title}
            />
          </div>
          <div className="faculty-retrospective-copy">
            <p className="faculty-section-index">Ретроспектива · {activeFaculty.name}</p>
            <h2>{activeFaculty.history.title}</h2>
            <p>{activeFaculty.history.text}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
