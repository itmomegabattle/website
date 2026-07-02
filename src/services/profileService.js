import { supabase } from "../lib/supabase";

export async function getProfileById(profileId) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateProfile(profileId, values) {
  const { data, error } = await supabase
    .from("profiles")
    .update(values)
    .eq("id", profileId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function uploadAvatar(profileId, file) {
  const extension = file.name.split(".").pop() || "jpg";
  const path = `${profileId}/${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from("profile-avatars")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from("profile-avatars").getPublicUrl(path);
  return data.publicUrl;
}

export async function getTagByCode(code) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("nfc_tags")
    .select("*, profiles(*)")
    .eq("code", code)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function ensureTag(code) {
  const existing = await getTagByCode(code);
  if (existing) return existing;

  const { data, error } = await supabase
    .from("nfc_tags")
    .insert({ code })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function claimTag({ code, profileId, label = "NFC-метка", tagType = "other" }) {
  const tag = await ensureTag(code);

  if (tag.profile_id && tag.profile_id !== profileId) {
    throw new Error("Эта NFC-метка уже привязана к другому профилю");
  }

  const { data, error } = await supabase
    .from("nfc_tags")
    .update({
      profile_id: profileId,
      label,
      tag_type: tagType,
      claimed_at: new Date().toISOString(),
    })
    .eq("code", code)
    .select("*, profiles(*)")
    .single();

  if (error) throw error;
  return data;
}

export async function getProfileTags(profileId) {
  if (!supabase || !profileId) return [];

  const { data, error } = await supabase
    .from("nfc_tags")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function addFriendship({ requesterProfileId, receiverProfileId }) {
  const { data, error } = await supabase
    .from("friendships")
    .upsert(
      {
        requester_profile_id: requesterProfileId,
        receiver_profile_id: receiverProfileId,
        status: "active",
      },
      { onConflict: "requester_profile_id,receiver_profile_id" },
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function logProfileView({ viewerProfileId, viewedProfileId, nfcTagId }) {
  if (!supabase || !viewedProfileId) return;

  await supabase.from("profile_views").insert({
    viewer_profile_id: viewerProfileId ?? null,
    viewed_profile_id: viewedProfileId,
    nfc_tag_id: nfcTagId ?? null,
  });
}

export async function getFriendshipGraph() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("friendships")
    .select("*, requester:profiles!friendships_requester_profile_id_fkey(id,nickname,faculty), receiver:profiles!friendships_receiver_profile_id_fkey(id,nickname,faculty)")
    .eq("status", "active");

  if (error) throw error;
  return data;
}
