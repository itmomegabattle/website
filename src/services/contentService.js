import { supabase } from "../lib/supabase";
import { logAdminAction } from "./adminService";

function requireSupabase() {
  if (!supabase) throw new Error("Supabase не настроен");
}

export function mapDbPartner(item) {
  return {
    id: item.id,
    sourceKey: item.source_key,
    name: item.name,
    logo: item.logo_url || "/images/about-image.png",
    description: item.description || "",
    link: item.link || "",
    status: item.status,
    sortOrder: item.sort_order,
  };
}

export function mapDbStory(item) {
  return {
    id: item.id,
    key: item.source_key || item.id,
    name: item.name,
    faculty: item.faculty || "",
    description: item.description || "",
    date: item.story_date_label || "",
    image: item.image_url || "/images/people/member.jpg",
    status: item.status,
    sortOrder: item.sort_order,
  };
}

export async function getPublishedPartners(fallback = []) {
  if (!supabase) return fallback;
  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data?.length) return fallback;
  return data.map(mapDbPartner);
}

export async function getAdminPartners() {
  requireSupabase();
  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function upsertPartner(partner, actorProfile) {
  requireSupabase();
  const payload = {
    ...partner,
    source_key: partner.source_key || partner.sourceKey || null,
  };
  delete payload.sourceKey;

  const { data, error } = await supabase
    .from("partners")
    .upsert(payload, { onConflict: payload.id ? "id" : "source_key" })
    .select()
    .single();
  if (error) throw error;
  await logAdminAction(actorProfile, partner.id ? "partner.update" : "partner.create", "partners", data.id, {
    name: data.name,
    status: data.status,
  });
  return data;
}

export async function deletePartner(id, actorProfile) {
  requireSupabase();
  await logAdminAction(actorProfile, "partner.delete", "partners", id);
  const { data, error } = await supabase.from("partners").delete().eq("id", id).select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("Партнёр не удалён: нет доступа или запись уже удалена");
}

export async function importStaticPartners(partners, actorProfile) {
  requireSupabase();
  const uniquePartners = Array.from(
    new Map(partners.map((partner) => [partner.partnerKey || partner.link || partner.name, partner])).values(),
  );
  const payload = uniquePartners.map((partner, index) => ({
    source_key: String(partner.partnerKey || partner.id || `${partner.name}-${index}`),
    status: "published",
    name: partner.name,
    logo_url: partner.logo || "",
    description: partner.description || "",
    link: partner.link || "",
    sort_order: index * 10,
  }));
  const { data, error } = await supabase.from("partners").upsert(payload, { onConflict: "source_key" }).select();
  if (error) throw error;
  await logAdminAction(actorProfile, "partner.import_json", "partners", null, { count: data?.length || 0 });
  return data || [];
}

export async function getPublishedStories(fallback = []) {
  if (!supabase) return fallback;
  const { data, error } = await supabase
    .from("participant_stories")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data?.length) return fallback;
  return data.map(mapDbStory);
}

export async function getAdminStories() {
  requireSupabase();
  const { data, error } = await supabase
    .from("participant_stories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function upsertStory(story, actorProfile) {
  requireSupabase();
  const payload = {
    ...story,
    source_key: story.source_key || story.key || null,
  };
  delete payload.key;

  const { data, error } = await supabase
    .from("participant_stories")
    .upsert(payload, { onConflict: payload.id ? "id" : "source_key" })
    .select()
    .single();
  if (error) throw error;
  await logAdminAction(actorProfile, story.id ? "story.update" : "story.create", "participant_stories", data.id, {
    name: data.name,
    status: data.status,
  });
  return data;
}

export async function deleteStory(id, actorProfile) {
  requireSupabase();
  await logAdminAction(actorProfile, "story.delete", "participant_stories", id);
  const { data, error } = await supabase.from("participant_stories").delete().eq("id", id).select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("История не удалена: нет доступа или запись уже удалена");
}

export async function importStaticStories(stories, actorProfile) {
  requireSupabase();
  const payload = stories.map((story, index) => ({
    source_key: story.key || `${story.name}-${index}`,
    status: "published",
    name: story.name,
    faculty: story.faculty || "",
    description: story.description || "",
    story_date_label: story.date || "",
    image_url: story.image || "",
    sort_order: index * 10,
  }));
  const { data, error } = await supabase
    .from("participant_stories")
    .upsert(payload, { onConflict: "source_key" })
    .select();
  if (error) throw error;
  await logAdminAction(actorProfile, "story.import_json", "participant_stories", null, { count: data?.length || 0 });
  return data || [];
}

export async function uploadContentImage(file, folder = "content") {
  requireSupabase();
  const extension = file.name.split(".").pop() || "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(16).slice(2)}.${extension}`;
  const { error } = await supabase.storage.from("content-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("content-images").getPublicUrl(path);
  return data.publicUrl;
}
