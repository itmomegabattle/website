import { supabase } from "../lib/supabase";
import { backendApi } from "../lib/backendApi";

export const bootstrapAdminIsu = "466870";
export const isAdminProfile = (profile) => Boolean(profile?.is_admin || profile?.roles?.some((role) => ["admin", "site_admin"].includes(role)));
export async function logAdminAction() { /* Backend writes an audit record for every mutation. */ }

export async function getAdminEvents() { return (await backendApi("/api/v1/admin/content/events")).items ?? []; }
export async function upsertAdminEvent(event) { return backendApi(`/api/v1/admin/content/events${event.id ? `/${event.id}` : ""}`, { method: event.id ? "PATCH" : "POST", body: JSON.stringify(event) }); }
export const deleteAdminEvent = (eventId) => backendApi(`/api/v1/admin/content/events/${eventId}`, { method: "DELETE" });
export async function uploadAdminEventImage(file) { return uploadAdminMedia(file); }

async function uploadAdminMedia(file) {
  const signed=await backendApi("/api/v1/media/upload",{method:"POST",body:JSON.stringify({mimeType:file.type,sizeBytes:file.size,purpose:"content"})});
  if(!supabase)throw new Error("Storage не настроен"); const {error}=await supabase.storage.from(signed.bucket).uploadToSignedUrl(signed.path,signed.token,file,{contentType:file.type}); if(error)throw error; return signed.publicUrl;
}

const mapAdminProfile=(item)=>({...item,is_admin:item.profile_roles?.some((role)=>role.role==="admin"||role.role==="site_admin")});
export async function getAdminProfiles({ search="", all=false }={}) {
  const params=new URLSearchParams({limit:all?"100":"10",offset:"0",includeDeleted:"true"});
  if(search.trim())params.set("search",search.trim());
  let result=await backendApi(`/api/v1/admin/profiles?${params}`); let items=result.items??[];
  if(all){ for(let offset=items.length;offset<result.total;offset+=100){params.set("offset",String(offset));const page=await backendApi(`/api/v1/admin/profiles?${params}`);items.push(...(page.items??[]));} }
  return {items:items.map(mapAdminProfile),total:result.total??items.length};
}
export async function updateAdminProfile(profileId, values) {
  if (Object.hasOwn(values,"is_admin")) await backendApi(`/api/v1/admin/profiles/${profileId}/roles/admin`,{method:values.is_admin?"PUT":"DELETE"});
  const moderation={}; for(const key of ["is_banned","ban_reason","role_badge","is_best_actor"]) if(Object.hasOwn(values,key)) moderation[key]=values[key];
  if(Object.keys(moderation).length) return backendApi(`/api/v1/admin/profiles/${profileId}/moderation`,{method:"PATCH",body:JSON.stringify(moderation)});
  return {ok:true};
}
export const deleteAdminProfile=(profileId)=>backendApi(`/api/v1/admin/profiles/${profileId}`,{method:"DELETE"});

export async function getAdminNfcTags(){ return ((await backendApi("/api/v1/admin/nfc?limit=200")).tags??[]).map((item)=>({...item,profile:item.profiles})); }
export const createAdminNfcTags=(values)=>backendApi("/api/v1/admin/nfc",{method:"POST",body:JSON.stringify(values)});
export const updateAdminNfcTag=(tagId,values)=>backendApi(`/api/v1/admin/nfc/${tagId}`,{method:"PATCH",body:JSON.stringify(values)});

const pin=()=>sessionStorage.getItem("mb_vault_pin")||"";
export async function unlockAdminVault(value){ await backendApi("/api/v1/admin/vault/unlock",{method:"POST",body:JSON.stringify({pin:value})}); sessionStorage.setItem("mb_vault_pin",value); }
export async function getAdminPasswords(){ const value=pin(); if(!value)return []; const data=await backendApi("/api/v1/admin/vault/list",{method:"POST",body:JSON.stringify({pin:value})}); return (data.entries??[]).map((item)=>({...item,password_value:item.password,login:item.login,url:item.url,notes:item.notes})); }
export async function upsertAdminPassword(secret){ const value=pin(); if(!value)throw new Error("Сначала открой vault"); const entry={title:secret.title,login:secret.login||null,password:secret.password_value||null,url:secret.url||null,notes:secret.notes||null}; return backendApi(`/api/v1/admin/vault${secret.id?`/${secret.id}`:""}`,{method:secret.id?"PUT":"POST",body:JSON.stringify({pin:value,entry})}); }
export const deleteAdminPassword=(secretId)=>backendApi(`/api/v1/admin/vault/${secretId}`,{method:"DELETE",body:JSON.stringify({pin:pin()})});
export async function getAdminAuditLogs(){ const data=await backendApi("/api/v1/admin/audit?limit=50"); return (data.logs??[]).map((item)=>({...item,actor:item.profiles})); }
