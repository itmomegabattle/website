import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  deleteTeamMember,
  getAdminTeamMembers,
  importStaticTeamMembers,
  uploadTeamMemberImage,
  upsertTeamMember,
} from "../../services/teamService";
import { emptyMember, linksToText, textToLinks } from "./memberConfig";

export default function TeamAdminEditor({ section, fallbackMembers }) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [form, setForm] = useState(() => ({ ...emptyMember, section }));
  const [linksText, setLinksText] = useState("");
  const [status, setStatus] = useState("");
  const queryKey = ["admin-team-members", section];
  const { data = [], error } = useQuery({
    queryKey,
    queryFn: () => getAdminTeamMembers(section),
    enabled: isOpen,
  });

  const refreshPublicLists = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: ["organizers"] }),
    queryClient.invalidateQueries({ queryKey: ["responsible"] }),
    queryClient.invalidateQueries({ queryKey: ["contributors"] }),
    queryClient.invalidateQueries({ queryKey }),
  ]);
  const saveMutation = useMutation({
    mutationFn: (payload) => upsertTeamMember(payload, profile),
    onSuccess: () => {
      setStatus("Сохранено");
      setSelectedMember(null);
      setForm({ ...emptyMember, section });
      setLinksText("");
      refreshPublicLists();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTeamMember(id, profile),
    onSuccess: async (_, deletedId) => {
      if (selectedMember?.id === deletedId) setSelectedMember(null);
      setStatus("Человек удалён");
      await refreshPublicLists();
    },
  });
  const importMutation = useMutation({
    mutationFn: () => importStaticTeamMembers(section, fallbackMembers, profile),
    onSuccess: (items) => {
      setStatus(`Импортировано: ${items.length}`);
      refreshPublicLists();
    },
  });

  useEffect(() => {
    if (!selectedMember) {
      setForm({ ...emptyMember, section });
      setLinksText("");
      return;
    }
    setForm({ ...emptyMember, ...selectedMember, section, links: selectedMember.links || [] });
    setLinksText(linksToText(selectedMember.links));
  }, [selectedMember, section]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };
  const handleImage = async (event, field) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus("Загружаем фото…");
    const imageUrl = await uploadTeamMemberImage(file, field === "small_image_url" ? "thumbnail" : "content");
    setForm((current) => ({ ...current, [field]: imageUrl }));
    setStatus("Фото загружено");
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    saveMutation.mutate({
      ...form,
      section,
      source_key: form.source_key || `${section}-${Date.now()}`,
      links: textToLinks(linksText),
    });
  };
  const requestDelete = (member) => {
    if (!window.confirm(`Удалить «${member.name}» из раздела? Это действие нельзя отменить.`)) return;
    setStatus("");
    deleteMutation.mutate(member.id);
  };

  return (
    <div className="team-admin">
      <button className="team-admin-toggle" type="button" onClick={() => setIsOpen((value) => !value)}>
        {isOpen ? "Скрыть редактор" : "Режим редактора"}
      </button>
      {isOpen && (
        <div className="team-admin-panel">
          <div className="team-admin-head">
            <div>
              <p className="card-kicker">Inline admin</p>
              <h2>{section === "organizers" ? "Организаторы" : "Ответственные"}</h2>
            </div>
            <button type="button" onClick={() => importMutation.mutate()} disabled={importMutation.isPending}>
              {importMutation.isPending ? "Импортируем…" : "Импортировать JSON"}
            </button>
          </div>
          <div className="team-admin-grid">
            <form className="team-admin-form" onSubmit={handleSubmit}>
              <div className="team-admin-form-grid">
                <label className="form-field"><span>Имя</span><input name="name" value={form.name} onChange={updateField} required /></label>
                <label className="form-field"><span>Статус</span><select name="status" value={form.status} onChange={updateField}><option value="draft">Черновик</option><option value="published">Опубликовано</option><option value="archived">Архив</option></select></label>
                <label className="form-field"><span>Короткая роль</span><input name="activity" value={form.activity || ""} onChange={updateField} /></label>
                <label className="form-field"><span>Роль в карточке</span><input name="role" value={form.role || ""} onChange={updateField} /></label>
              </div>
              <label className="form-field"><span>Описание</span><textarea name="description" value={form.description || ""} onChange={updateField} rows="4" /></label>
              <label className="form-field"><span>Ссылки: текст | ссылка</span><textarea value={linksText} onChange={(event) => setLinksText(event.target.value)} rows="3" /></label>
              <div className="team-admin-form-grid">
                <label className="form-field"><span>Маленькое фото</span><input type="file" accept="image/*" onChange={(event) => handleImage(event, "small_image_url")} /></label>
                <label className="form-field"><span>Большое фото</span><input type="file" accept="image/*" onChange={(event) => handleImage(event, "big_image_url")} /></label>
              </div>
              {saveMutation.error && <p className="form-error">{saveMutation.error.message}</p>}
              {deleteMutation.error && <p className="form-error">{deleteMutation.error.message}</p>}
              {error && <p className="form-error">{error.message}</p>}
              {status && <p className="form-status">{status}</p>}
              <button className="text-button auth-submit" type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Сохраняем…" : selectedMember ? "Сохранить изменения" : "Добавить человека"}
              </button>
            </form>
            <div className="team-admin-list">
              {data.map((member) => (
                <div className="team-admin-row" key={member.id}>
                  <div><strong>{member.name}</strong><span>{member.status} · {member.activity || "роль не указана"}</span></div>
                  <div>
                    <button type="button" onClick={() => setSelectedMember(member)}>Изменить</button>
                    <button type="button" onClick={() => requestDelete(member)} disabled={deleteMutation.isPending}>
                      {deleteMutation.isPending && deleteMutation.variables === member.id ? "Удаляем…" : "Удалить"}
                    </button>
                  </div>
                </div>
              ))}
              {!data.length && <p>В БД пока пусто. Нажми “Импортировать JSON”, чтобы перенести текущий список.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
