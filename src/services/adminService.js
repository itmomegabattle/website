import { supabase } from "../lib/supabase";

export const bootstrapAdminIsu = "466870";

export function isAdminProfile(profile) {
  return Boolean(profile?.is_admin || profile?.isu_number === bootstrapAdminIsu);
}

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase не настроен");
  }
}

export async function logAdminAction(profile, action, entityType, entityId, payload = {}) {
  requireSupabase();
  const { error } = await supabase.from("admin_audit_logs").insert({
    actor_profile_id: profile?.id,
    action,
    entity_type: entityType,
    entity_id: entityId ? String(entityId) : null,
    payload,
  });
  if (error) throw error;
}

export async function getAdminEvents() {
  requireSupabase();
  const { data, error } = await supabase
    .from("project_events")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function upsertAdminEvent(event, actorProfile) {
  requireSupabase();
  const { data, error } = await supabase
    .from("project_events")
    .upsert(event, { onConflict: "slug" })
    .select()
    .single();
  if (error) throw error;
  await logAdminAction(actorProfile, event.id ? "event.update" : "event.create", "project_events", data.id, {
    slug: data.slug,
    status: data.status,
  });
  return data;
}

export async function deleteAdminEvent(eventId, actorProfile) {
  requireSupabase();
  await logAdminAction(actorProfile, "event.delete", "project_events", eventId);
  const { data, error } = await supabase.from("project_events").delete().eq("id", eventId).select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("Событие не удалено: нет доступа или запись уже удалена");
}

export async function uploadAdminEventImage(file) {
  requireSupabase();
  const extension = file.name.split(".").pop() || "jpg";
  const path = `events/${Date.now()}-${Math.random().toString(16).slice(2)}.${extension}`;
  const { error } = await supabase.storage.from("event-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("event-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function getAdminProfiles() {
  requireSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateAdminProfile(profileId, values, actorProfile) {
  requireSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .update(values)
    .eq("id", profileId)
    .select()
    .single();
  if (error) throw error;
  await logAdminAction(actorProfile, "profile.update", "profiles", profileId, values);
  return data;
}

export async function deleteAdminProfile(profileId, actorProfile) {
  requireSupabase();
  await logAdminAction(actorProfile, "profile.delete", "profiles", profileId);
  const { data, error } = await supabase.from("profiles").delete().eq("id", profileId).select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("Профиль не удалён: нет доступа или запись уже удалена");
}

export async function getAdminPasswords() {
  requireSupabase();
  const { data, error } = await supabase
    .from("project_passwords")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function upsertAdminPassword(secret, actorProfile) {
  requireSupabase();
  const { data, error } = await supabase
    .from("project_passwords")
    .upsert(secret)
    .select()
    .single();
  if (error) throw error;
  await logAdminAction(actorProfile, secret.id ? "password.update" : "password.create", "project_passwords", data.id, {
    title: data.title,
  });
  return data;
}

export async function deleteAdminPassword(secretId, actorProfile) {
  requireSupabase();
  await logAdminAction(actorProfile, "password.delete", "project_passwords", secretId);
  const { data, error } = await supabase.from("project_passwords").delete().eq("id", secretId).select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("Запись не удалена: нет доступа или запись уже удалена");
}

export async function getAdminAuditLogs() {
  requireSupabase();
  const { data, error } = await supabase
    .from("admin_audit_logs")
    .select("*, actor:profiles(nickname,isu_number)")
    .order("created_at", { ascending: false })
    .limit(40);
  if (error) throw error;
  return data || [];
}
