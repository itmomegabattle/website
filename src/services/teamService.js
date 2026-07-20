import { supabase } from "../lib/supabase";
import { backendApi } from "../lib/backendApi";

const mapDbMember = (member) => ({ key: member.source_key || member.id, id: member.id, name: member.name, activity: member.activity || "", role: member.role || "", description: member.description || "", links: Array.isArray(member.links) ? member.links : [], smallImage: member.small_image_url || "/images/people/member-full.jpg", bigImage: member.big_image_url || member.small_image_url || "/images/people/member.jpg" });
export async function getPublishedTeamMembers(section, fallback = []) { try { const data=await backendApi("/api/v1/content/people?limit=200"); const rows=(data.items??[]).filter((item)=>item.section===section); return rows.map(mapDbMember); } catch{return fallback;} }
export async function getAdminTeamMembers(section) { const data=await backendApi("/api/v1/admin/content/people"); return (data.items??[]).filter((item)=>item.section===section); }
export async function upsertTeamMember(member) { const payload={...member,source_key:member.source_key||member.key||null}; delete payload.key; return backendApi(`/api/v1/admin/content/people${member.id?`/${member.id}`:""}`,{method:member.id?"PATCH":"POST",body:JSON.stringify(payload)}); }
export const deleteTeamMember=(memberId)=>backendApi(`/api/v1/admin/content/people/${memberId}`,{method:"DELETE"});
export async function uploadTeamMemberImage(file) { const signed=await backendApi("/api/v1/media/upload",{method:"POST",body:JSON.stringify({mimeType:file.type,sizeBytes:file.size,purpose:"content"})}); if(!supabase)throw new Error("Storage не настроен"); const {error}=await supabase.storage.from(signed.bucket).uploadToSignedUrl(signed.path,signed.token,file,{contentType:file.type}); if(error)throw error; return signed.publicUrl; }
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
