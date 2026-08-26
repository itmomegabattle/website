import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Api } from "../../../api";
import FacultySearch from "./FacultySearch";
import FacultySwitcher from "./FacultySwitcher";
import FacultyOverview from "./FacultyOverview";
import FacultyRetro from "./FacultyRetro";
import "./faculty-explorer.css";

const UNIT_TITLES = {
  directions: (name) => `Направления ${name}`,
  units: (name) => `Структура и программы ${name}`,
  faculties: (name) => `Факультеты ${name}`,
};

export default function FacultyExplorer() {
  const faculties = useQuery({
    queryKey: ["faculties"],
    queryFn: Api.getFaculties,
    placeholderData: [],
  }).data;
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedFaculty = searchParams.get("faculty");
  const [activeId, setActiveId] = useState(requestedFaculty || "ktu");
  // Ретро листается независимо от основного раздела, из роута берётся только старт.
  const [retroId, setRetroId] = useState(requestedFaculty || "ktu");
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const activeFaculty = useMemo(
    () => faculties.find((faculty) => faculty.id === activeId) ?? faculties[0] ?? null,
    [faculties, activeId],
  );
  const retroFaculty = useMemo(
    () => faculties.find((faculty) => faculty.id === retroId) ?? faculties[0] ?? null,
    [faculties, retroId],
  );
  const buildUnitTitle = UNIT_TITLES[activeFaculty?.unitType] ?? UNIT_TITLES.faculties;
  const unitTitle = buildUnitTitle(activeFaculty?.name ?? "");

  useEffect(() => {
    if (requestedFaculty && faculties.some((faculty) => faculty.id === requestedFaculty)) {
      setActiveId(requestedFaculty);
    }
  }, [faculties, requestedFaculty]);

  const selectFaculty = (faculty, clearSearch = false) => {
    setActiveId(faculty.id);
    setSearchParams(
      { faculty: faculty.id },
      { replace: true, preventScrollReset: true },
    );
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
      <FacultySearch
        faculties={faculties}
        query={query}
        onQueryChange={setQuery}
        isOpen={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onSelect={selectFaculty}
      />
      <FacultySwitcher
        faculties={faculties}
        activeId={activeFaculty.id}
        onSelect={(faculty) => selectFaculty(faculty, true)}
      />
      <div className="faculty-dynamic-page" key={`overview-${activeFaculty.id}`}>
        <FacultyOverview faculty={activeFaculty} unitTitle={unitTitle} />
      </div>
      <FacultyRetro
        faculty={retroFaculty}
        switcher={
          <FacultySwitcher
            faculties={faculties}
            activeId={retroFaculty.id}
            onSelect={(faculty) => setRetroId(faculty.id)}
          />
        }
      />
    </div>
  );
}
