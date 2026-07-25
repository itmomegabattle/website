import { supabase } from "../lib/supabase";
import { backendApi } from "../lib/backendApi";
import { uploadOptimizedImage } from "../utils/uploadOptimizedImage";

export const mapDbPartner = (item) => ({ id: item.id, sourceKey: item.source_key, name: item.name, logo: item.logo_url || "/images/about-image.png", description: item.description || "", link: item.link || "", status: item.status, sortOrder: item.sort_order });
export const mapDbStory = (item) => ({ id: item.id, key: item.source_key || item.id, name: item.name, faculty: item.faculty || "", description: item.description || "", date: item.story_date_label || "", image: item.image_url || "/images/people/member.jpg", status: item.status, sortOrder: item.sort_order, submitterProfileId: item.submitter_profile_id, submitterContact: item.submitter_contact || "", moderationComment: item.moderation_comment || "", createdAt: item.created_at });

export async function getPublishedPartners(fallback = []) {
  try {
    const data = await backendApi("/api/v1/content/partners?limit=200");
    const items = data.items ?? [];
    return items.length > 0 ? items.map(mapDbPartner) : fallback;
  } catch {
    return fallback;
  }
}
export async function getAdminPartners() { return (await backendApi("/api/v1/admin/content/partners")).items ?? []; }
export async function upsertPartner(partner) {
  const payload = { ...partner, source_key: partner.source_key || partner.sourceKey || null }; delete payload.sourceKey;
  return backendApi(`/api/v1/admin/content/partners${partner.id ? `/${partner.id}` : ""}`, { method: partner.id ? "PATCH" : "POST", body: JSON.stringify(payload) });
}
export const deletePartner = (id) => backendApi(`/api/v1/admin/content/partners/${id}`, { method: "DELETE" });
export async function importStaticPartners(partners) {
  const unique = Array.from(new Map(partners.map((partner, index) => [
    String(partner.partnerKey || partner.sourceKey || partner.id || partner.link || `${partner.name}-${index}`),
    partner,
  ])).entries());
  const existing = await getAdminPartners();
  const existingByKey = new Map(existing.map((partner) => [String(partner.source_key || ""), partner]));
  const rows = [];
  for (const [index, [sourceKey, partner]] of unique.entries()) {
    rows.push(await upsertPartner({
      ...(existingByKey.get(sourceKey)?.id ? { id: existingByKey.get(sourceKey).id } : {}),
      source_key: sourceKey,
      status: "published",
      name: partner.name,
      logo_url: partner.logo || "",
      description: partner.description || "",
      link: partner.link || "",
      sort_order: index * 10,
    }));
  }
  return rows;
}

export async function getPublishedStories(fallback = []) {
  try {
    const data = await backendApi("/api/v1/content/stories?limit=200");
    const items = data.items ?? [];
    return items.length > 0 ? items.map(mapDbStory) : fallback;
  } catch {
    return fallback;
  }
}
export async function getAdminStories() { return (await backendApi("/api/v1/admin/content/stories")).items ?? []; }
export async function upsertStory(story) {
  const payload = { ...story, source_key: story.source_key || story.key || null }; for (const key of ["key","submitterProfileId","submitterContact","moderationComment","createdAt"]) delete payload[key];
  return backendApi(`/api/v1/admin/content/stories${story.id ? `/${story.id}` : ""}`, { method: story.id ? "PATCH" : "POST", body: JSON.stringify(payload) });
}
export const deleteStory = (id) => backendApi(`/api/v1/admin/content/stories/${id}`, { method: "DELETE" });
export async function importStaticStories(stories) {
  const existing = await getAdminStories();
  const existingByKey = new Map(existing.map((story) => [String(story.source_key || ""), story]));
  const rows=[];
  for (const [index,story] of stories.entries()) {
    const sourceKey = String(story.key || `${story.name}-${index}`);
    rows.push(await upsertStory({
      ...(existingByKey.get(sourceKey)?.id ? { id: existingByKey.get(sourceKey).id } : {}),
      source_key: sourceKey,
      status:"published",
      name:story.name,
      faculty:story.faculty||"",
      description:story.description||"",
      story_date_label:story.date||"",
      image_url:story.image||"",
      sort_order:index*10,
    }));
  }
  return rows;
}
export async function submitStoryProposal(story, profile) {
  if (!profile?.id) throw new Error("Нужно войти в профиль, чтобы предложить историю");
  return backendApi("/api/v1/stories/submissions", { method: "POST", body: JSON.stringify({ name: story.name, faculty: story.faculty || profile.faculty, description: story.description, storyDateLabel: story.story_date_label || null, imageUrl: story.image_url || null, contact: story.submitter_contact || null }) });
}
export async function uploadContentImage(file, folder = "content") {
  if (!supabase) throw new Error("Storage не настроен");
  return uploadOptimizedImage(file, {
    preset: folder === "partners" ? "thumbnail" : "content",
    purpose: folder === "story-submissions" ? "story" : "content",
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
export const uploadStorySubmissionImage = (file) => uploadContentImage(file, "story-submissions");
