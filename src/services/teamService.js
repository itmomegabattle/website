import { supabase } from "../lib/supabase";
import { backendApi } from "../lib/backendApi";
import { uploadOptimizedImage } from "../utils/uploadOptimizedImage";

const mapDbMember = (member) => ({ key: member.source_key || member.id, id: member.id, name: member.name, activity: member.activity || "", role: member.role || "", description: member.description || "", links: Array.isArray(member.links) ? member.links : [], smallImage: member.small_image_url || "/images/people/member-full.jpg", bigImage: member.big_image_url || member.small_image_url || "/images/people/member.jpg" });
export async function getPublishedTeamMembers(section, fallback = []) {
  try {
    const data = await backendApi("/api/v1/content/people?limit=200");
    const rows = (data.items ?? []).filter((item) => item.section === section);
    return rows.length > 0 ? rows.map(mapDbMember) : fallback;
  } catch {
    return fallback;
  }
}
export async function getAdminTeamMembers(section) { const data=await backendApi("/api/v1/admin/content/people"); return (data.items??[]).filter((item)=>item.section===section); }

async function getAllAdminTeamMembers() {
  const data = await backendApi("/api/v1/admin/content/people");
  return data.items ?? [];
}

async function rawUpsertTeamMember(member) {
  const payload = { ...member, source_key: member.source_key || member.key || null };
  delete payload.key;
  return backendApi(`/api/v1/admin/content/people${member.id ? `/${member.id}` : ""}`, {
    method: member.id ? "PATCH" : "POST",
    body: JSON.stringify(payload),
  });
}

async function preserveContributor(member) {
  if (!["organizers", "responsible"].includes(member.section)) return;
  const sourceKey = member.source_key || member.key || member.id;
  if (!sourceKey) return;
  const contributorKey = `contributor:${sourceKey}`;
  const existing = (await getAllAdminTeamMembers()).find(
    (item) => item.section === "contributors" && item.source_key === contributorKey,
  );

  await rawUpsertTeamMember({
    ...(existing?.id ? { id: existing.id } : {}),
    source_key: contributorKey,
    section: "contributors",
    status: "published",
    name: member.name,
    activity: member.activity || (member.section === "organizers" ? "Организатор" : "Ответственный"),
    role: member.role || "",
    description: member.description || "",
    links: member.links || [],
    small_image_url: member.small_image_url || member.smallImage || "",
    big_image_url: member.big_image_url || member.bigImage || member.small_image_url || member.smallImage || "",
    sort_order: existing?.sort_order ?? member.sort_order ?? 100,
  });
}

export async function upsertTeamMember(member) {
  const saved = await rawUpsertTeamMember(member);
  await preserveContributor({ ...member, ...saved });
  return saved;
}

export async function deleteTeamMember(memberId) {
  const member = (await getAllAdminTeamMembers()).find((item) => item.id === memberId);
  if (member) await preserveContributor(member);
  return backendApi(`/api/v1/admin/content/people/${memberId}`, { method: "DELETE" });
}
export async function uploadTeamMemberImage(file, preset = "content") {
  if (!supabase) throw new Error("Storage не настроен");
  return uploadOptimizedImage(file, {
    preset,
    purpose: "content",
    requestUpload: (payload) => backendApi("/api/v1/media/upload", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
    uploadFile: async (signed, optimizedFile) => {
      const { error } = await supabase.storage
        .from(signed.bucket)
        .uploadToSignedUrl(signed.path, signed.token, optimizedFile, { contentType: optimizedFile.type });
      if (error) throw error;
    },
  });
}
export async function importStaticTeamMembers(section,members) {
  const existing=await getAdminTeamMembers(section);
  const existingByKey=new Map(existing.map((member)=>[String(member.source_key||""),member]));
  const rows=[];
  for(const [index,member] of members.entries()) {
    const sourceKey=String(member.key||`${section}-${index}`);
    rows.push(await upsertTeamMember({
      ...(existingByKey.get(sourceKey)?.id?{id:existingByKey.get(sourceKey).id}:{}),
      source_key:sourceKey,section,status:"published",name:member.name,activity:member.activity||"",role:member.role||"",description:member.description||"",links:member.links||[],small_image_url:member.smallImage||"",big_image_url:member.bigImage||member.smallImage||"",sort_order:index*10,
    }));
  }
  return rows;
}
