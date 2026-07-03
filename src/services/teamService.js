import { supabase } from "../lib/supabase";
import { logAdminAction } from "./adminService";

function mapDbMember(member) {
  return {
    key: member.source_key || member.id,
    id: member.id,
    name: member.name,
    activity: member.activity || "",
    role: member.role || "",
    description: member.description || "",
    links: Array.isArray(member.links) ? member.links : [],
    smallImage: member.small_image_url || "/images/people/member-full.jpg",
    bigImage: member.big_image_url || member.small_image_url || "/images/people/member.jpg",
  };
}

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase не настроен");
  }
}

export async function getPublishedTeamMembers(section, fallback = []) {
  if (!supabase) return fallback;

  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("section", section)
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data?.length) {
    return fallback;
  }

  return data.map(mapDbMember);
}

export async function getAdminTeamMembers(section) {
  requireSupabase();
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("section", section)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function upsertTeamMember(member, actorProfile) {
  requireSupabase();
  const payload = {
    ...member,
    source_key: member.source_key || member.key || null,
  };
  delete payload.key;

  const { data, error } = await supabase
    .from("team_members")
    .upsert(payload, { onConflict: payload.id ? "id" : "source_key" })
    .select()
    .single();
  if (error) throw error;
  await logAdminAction(actorProfile, member.id ? "team_member.update" : "team_member.create", "team_members", data.id, {
    name: data.name,
    section: data.section,
    status: data.status,
  });
  return data;
}

export async function deleteTeamMember(memberId, actorProfile) {
  requireSupabase();
  await logAdminAction(actorProfile, "team_member.delete", "team_members", memberId);
  const { data, error } = await supabase.from("team_members").delete().eq("id", memberId).select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("Человек не удалён: нет доступа или запись уже удалена");
}

export async function uploadTeamMemberImage(file) {
  requireSupabase();
  const extension = file.name.split(".").pop() || "jpg";
  const path = `team/${Date.now()}-${Math.random().toString(16).slice(2)}.${extension}`;
  const { error } = await supabase.storage.from("team-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("team-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function importStaticTeamMembers(section, members, actorProfile) {
  requireSupabase();
  const payload = members.map((member, index) => ({
    source_key: member.key || `${section}-${index}`,
    section,
    status: "published",
    name: member.name,
    activity: member.activity || "",
    role: member.role || "",
    description: member.description || "",
    links: member.links || [],
    small_image_url: member.smallImage || "",
    big_image_url: member.bigImage || member.smallImage || "",
    sort_order: index * 10,
  }));

  const { data, error } = await supabase
    .from("team_members")
    .upsert(payload, { onConflict: "source_key" })
    .select();
  if (error) throw error;
  await logAdminAction(actorProfile, "team_member.import_json", "team_members", null, { section, count: data?.length || 0 });
  return data || [];
}
