import {
  deleteTeamMember,
  getAdminTeamMembers,
  getPublishedTeamMembers,
  upsertTeamMember,
} from "./teamService";

const FACULTY_RATING_SECTION = "faculty-ratings";

function sortRatings(rows) {
  return [...rows]
    .filter((item) => item.name && Number.isFinite(Number(item.score)))
    .sort((first, second) => Number(second.score) - Number(first.score))
    .map((item, index) => ({ ...item, place: index + 1 }));
}

function mapPublishedRating(item) {
  return {
    id: item.id,
    name: item.name,
    faculty: item.name,
    score: Number(item.activity) || 0,
    badge: item.description || item.role || "",
  };
}

function mapAdminRating(item) {
  return {
    id: item.id,
    sourceKey: item.source_key,
    name: item.name || "",
    score: Number(item.activity) || 0,
    badge: item.description || item.role || "",
    status: item.status || "published",
  };
}

export async function getPublishedFacultyRatings(fallback = []) {
  const rows = await getPublishedTeamMembers(FACULTY_RATING_SECTION, []);
  return rows.length ? sortRatings(rows.map(mapPublishedRating)) : fallback;
}

export async function getAdminFacultyRatings() {
  const rows = await getAdminTeamMembers(FACULTY_RATING_SECTION);
  return sortRatings(rows.map(mapAdminRating));
}

export function upsertFacultyRating(rating) {
  const sourceKey = rating.sourceKey || `faculty-rating:${Date.now()}`;
  return upsertTeamMember({
    ...(rating.id ? { id: rating.id } : {}),
    source_key: sourceKey,
    section: FACULTY_RATING_SECTION,
    status: rating.status || "published",
    name: rating.name.trim(),
    activity: String(Math.max(0, Number(rating.score) || 0)),
    role: "",
    description: rating.badge?.trim() || "",
    links: [],
    small_image_url: "",
    big_image_url: "",
    sort_order: Math.max(0, Number(rating.score) || 0),
  });
}

export function deleteFacultyRating(id) {
  return deleteTeamMember(id);
}
