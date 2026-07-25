import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { uploadAdminEventImage, upsertAdminEvent } from "../../services/adminService";
import { emptyEvent, mapEventToForm, toSlug } from "./eventConfig";

export default function InlineEventEditor({ groupId, selectedEvent, onClose }) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(() => selectedEvent ? mapEventToForm(selectedEvent, groupId) : { ...emptyEvent, group_key: groupId });
  const [detailsText, setDetailsText] = useState(() => (selectedEvent?.details || []).join("\n"));
  const [status, setStatus] = useState("");
  const saveMutation = useMutation({
    mutationFn: (payload) => upsertAdminEvent(payload, profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["admin-events-inline"] });
      setStatus("Событие сохранено");
      onClose?.();
    },
  });
  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === "sort_order" ? Number(value) : value,
      slug: name === "name" && !current.slug ? toSlug(value) : current.slug,
    }));
  };
  const handleImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus("Загружаем фото…");
    const imageUrl = await uploadAdminEventImage(file);
    setForm((current) => ({ ...current, image_url: imageUrl }));
    setStatus("Фото загружено");
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    saveMutation.mutate({
      ...form,
      slug: form.slug || toSlug(form.name),
      group_key: groupId,
      details: detailsText.split("\n").map((item) => item.trim()).filter(Boolean),
    });
  };

  return (
    <form className="event-inline-editor" onSubmit={handleSubmit}>
      <div className="event-inline-editor-head">
        <div><p className="card-kicker">Inline admin</p><h2>{selectedEvent ? "Редактировать мероприятие" : "Новое мероприятие"}</h2></div>
        <button type="button" onClick={onClose}>Закрыть</button>
      </div>
      <div className="event-inline-editor-grid">
        <label className="form-field"><span>Название</span><input name="name" value={form.name} onChange={updateField} required /></label>
        <label className="form-field"><span>Статус</span><select name="status" value={form.status} onChange={updateField}><option value="draft">Черновик</option><option value="published">Опубликовано</option><option value="archived">Архив</option></select></label>
        <label className="form-field"><span>Тип</span><input name="type" value={form.type || ""} onChange={updateField} /></label>
        <label className="form-field"><span>Дата</span><input name="event_date_label" value={form.event_date_label || ""} onChange={updateField} /></label>
        <label className="form-field"><span>Время</span><input name="event_time_label" value={form.event_time_label || ""} onChange={updateField} /></label>
        <label className="form-field"><span>Место</span><input name="location" value={form.location || ""} onChange={updateField} /></label>
      </div>
      <label className="form-field"><span>Описание</span><textarea name="description" rows="4" value={form.description || ""} onChange={updateField} /></label>
      <label className="form-field"><span>Детали, каждая с новой строки</span><textarea rows="3" value={detailsText} onChange={(event) => setDetailsText(event.target.value)} /></label>
      <div className="event-inline-editor-grid">
        <label className="form-field"><span>Фото</span><input type="file" accept="image/*" onChange={handleImage} /></label>
        <label className="form-field"><span>Регистрация</span><select name="registration_status" value={form.registration_status} onChange={updateField}><option value="open">Открыта</option><option value="soon">Скоро</option><option value="closed">Закрыта</option></select></label>
        <label className="form-field"><span>Текст кнопки</span><input name="registration_label" value={form.registration_label || ""} onChange={updateField} /></label>
        <label className="form-field"><span>Ссылка регистрации</span><input name="registration_link" value={form.registration_link || ""} onChange={updateField} /></label>
        <label className="form-field"><span>ID ITMO Events</span><input name="itmo_events_id" value={form.itmo_events_id || ""} onChange={updateField} /></label>
      </div>
      {saveMutation.error && <p className="form-error">{saveMutation.error.message}</p>}
      {status && <p className="form-status">{status}</p>}
      <button className="text-button auth-submit" type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Сохраняем…" : "Сохранить"}</button>
    </form>
  );
}
