import { supabase } from "../lib/supabase";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000").replace(/\/+$/, "");
async function api(path, options = {}) {
  const token = sessionStorage.getItem("mb_session_token");
  const response = await fetch(`${API_BASE}${path}`, { credentials: "include", ...options, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || data?.message || "Ошибка API");
  return data;
}

export const getProfileById = (profileId) => api(`/api/v1/profiles/${encodeURIComponent(profileId)}`);
export const updateProfile = (_profileId, values) => api("/api/v1/profile", { method: "PATCH", body: JSON.stringify(values) });

export async function uploadAvatar(_profileId, file) {
  const signed = await api("/api/v1/media/upload", { method: "POST", body: JSON.stringify({ mimeType: file.type, sizeBytes: file.size, purpose: "avatar" }) });
  if (!supabase) throw new Error("Storage не настроен");
  const { error } = await supabase.storage.from(signed.bucket).uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type });
  if (error) throw error;
  return signed.publicUrl;
}

export async function getTagByCode(code) {
  try { const data = await api(`/api/v1/nfc/${encodeURIComponent(code)}`); return { ...data.tag, profile_id: data.profile?.id, profiles: data.profile, canConnect: data.canConnect }; }
  catch (error) { if (error.message.includes("Метка")) return null; throw error; }
}

export async function ensureTag(code) {
  const existing = await getTagByCode(code); if (existing) return existing;
  throw new Error("Метка ещё не выпущена администратором");
}

export async function claimTag({ code, label = "NFC-метка", tagType = "other" }) {
  await api(`/api/v1/nfc/${encodeURIComponent(code)}/claim`, { method: "POST", body: JSON.stringify({ label, tagType }) });
  return getTagByCode(code);
}

export async function getProfileTags() { const data = await api("/api/v1/nfc"); return data.tags ?? []; }
export async function addFriendship({ receiverProfileId, nfcTagId }) { return api("/api/v1/connections", { method: "POST", body: JSON.stringify({ profileId: receiverProfileId, nfcTagId }) }); }
export async function transferCurrency({ receiverProfileId, amount }) {
  const idempotencyKey = `website-transfer:${crypto.randomUUID()}`;
  return api("/api/v1/game/transfers", { method: "POST", body: JSON.stringify({ receiverProfileId, amount, idempotencyKey }) });
}
export async function logProfileView() { /* NFC endpoint logs views atomically. */ }

export async function getFriendshipGraph() {
  const data = await api("/api/v1/connections/graph?limit=2000");
  const nodes = new Map((data.nodes ?? []).map((node) => [node.id, node]));
  return (data.edges ?? []).map((edge) => ({ ...edge, requester: nodes.get(edge.requester_profile_id), receiver: nodes.get(edge.receiver_profile_id) }));
}
