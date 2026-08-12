import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminSupportRequests, openAdminSupportAttachment, updateAdminSupportRequest } from "../../services/adminService";

const STATUS = { new: "Новое", in_progress: "В работе", resolved: "Решено" };

export default function SupportPanel() {
  const client = useQueryClient();
  const { data = [], error } = useQuery({ queryKey:["admin-support"], queryFn:getAdminSupportRequests });
  const mutation = useMutation({ mutationFn:({ id,status })=>updateAdminSupportRequest(id,status), onSuccess:()=>client.invalidateQueries({queryKey:["admin-support"]}) });
  return <article className="info-card admin-panel admin-support-panel">
    <div className="admin-panel-head"><div><h2>Обращения</h2><p>Вопросы из формы поддержки в подвале сайта.</p></div></div>
    {error && <p className="form-error">{error.message}</p>}
    <div className="admin-list">
      {data.map((item)=><div className={`admin-list-row admin-support-row status-${item.status}`} key={item.id}>
        <div><strong>{item.contact}</strong><span>{new Date(item.created_at).toLocaleString("ru-RU",{dateStyle:"long",timeStyle:"short"})} · {STATUS[item.status]}</span><p>{item.message}</p>{item.attachment_name&&<button type="button" onClick={()=>openAdminSupportAttachment(item.id)}>Открыть вложение · {item.attachment_name}</button>}</div>
        <div className="admin-row-actions"><button type="button" onClick={()=>mutation.mutate({id:item.id,status:"in_progress"})}>В работу</button><button type="button" onClick={()=>mutation.mutate({id:item.id,status:"resolved"})}>Решено</button></div>
      </div>)}
      {!data.length && <p>Обращений пока нет.</p>}
    </div>
  </article>;
}
