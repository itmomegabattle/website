// Поиск по структуре мегафакультетов: факультеты, подразделения,
// программы, направления и проекты ранжируются единой шкалой очков.

export function getDepartmentLabel(department) {
  return typeof department === "string" ? department : department.name;
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

export function buildSearchResults(faculties, query) {
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
