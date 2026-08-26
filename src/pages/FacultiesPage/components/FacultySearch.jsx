import { useMemo } from "react";
import { buildSearchResults } from "./searchIndex";
import "./faculty-search.css";

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

export default function FacultySearch({ faculties, query, onQueryChange, isOpen, onOpenChange, onSelect }) {
  const results = useMemo(() => buildSearchResults(faculties, query), [faculties, query]);

  return (
    <div className="faculty-search-zone">
      <label className="faculty-search" htmlFor="faculty-search-input">
        <SearchIcon />
        <input
          id="faculty-search-input"
          type="search"
          value={query}
          placeholder="Найди мегафакультет, подразделение, программу или направление"
          aria-label="Поиск по структуре мегафакультетов"
          autoComplete="off"
          onChange={(event) => {
            onQueryChange(event.target.value);
            onOpenChange(true);
          }}
          onFocus={() => onOpenChange(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              onOpenChange(false);
            }

            if (event.key === "Enter" && results[0]) {
              event.preventDefault();
              onSelect(results[0].faculty);
            }
          }}
        />
        {query ? (
          <button
            type="button"
            className="faculty-search-clear"
            aria-label="Очистить поиск"
            onClick={() => {
              onQueryChange("");
              onOpenChange(false);
            }}
          >
            ×
          </button>
        ) : (
          <span className="faculty-search-hint">СППО, ИВТ, ИИИ…</span>
        )}
      </label>

      {isOpen && query.trim() ? (
        <div className="faculty-search-results" role="listbox">
          {results.length ? (
            results.map((result) => (
              <button
                type="button"
                className="faculty-search-result"
                role="option"
                key={result.id}
                onClick={() => onSelect(result.faculty)}
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
  );
}
