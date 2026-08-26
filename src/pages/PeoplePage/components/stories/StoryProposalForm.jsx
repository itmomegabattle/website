import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../../context/AuthContext";
import { submitStoryProposal, uploadStorySubmissionImage } from "../../../../services/contentService";
import { EMPTY_PROPOSAL } from "./storyConfig";

export default function StoryProposalForm() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_PROPOSAL);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!profile) return;
    setForm((current) => ({
      ...current,
      name: current.name || profile.full_name || profile.nickname || "",
      faculty: current.faculty || profile.faculty || "",
    }));
  }, [profile]);

  const submitMutation = useMutation({
    mutationFn: (payload) => submitStoryProposal(payload, profile),
    onSuccess: () => {
      setStatus("История отправлена на модерацию. После одобрения она появится на странице.");
      setForm({
        ...EMPTY_PROPOSAL,
        name: profile?.full_name || profile?.nickname || "",
        faculty: profile?.faculty || "",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-stories"] });
    },
  });

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus("Загружаем фото…");
    const imageUrl = await uploadStorySubmissionImage(file);
    setForm((current) => ({ ...current, image_url: imageUrl }));
    setStatus("Фото загружено");
  };

  if (!profile) {
    return <div className="story-submit"><a className="story-submit-toggle" href="/auth">Войти и предложить историю</a></div>;
  }

  return (
    <div className="story-submit">
      <button className="story-submit-toggle" type="button" onClick={() => setIsOpen((value) => !value)}>
        {isOpen ? "Скрыть форму" : "Предложить историю"}
      </button>
      {isOpen && (
        <form className="story-submit-panel" onSubmit={(event) => { event.preventDefault(); submitMutation.mutate(form); }}>
          <div className="story-submit-head"><p className="card-kicker">Истории участников</p><h3>Предложить историю</h3></div>
          <div className="story-submit-grid">
            <label className="form-field"><span>Имя на карточке</span><input name="name" value={form.name} onChange={updateField} required /></label>
            <label className="form-field"><span>Факультет</span><input name="faculty" value={form.faculty} onChange={updateField} /></label>
            <label className="form-field"><span>Дата / сезон</span><input name="story_date_label" value={form.story_date_label} onChange={updateField} placeholder="например: ноябрь 2025" /></label>
            <label className="form-field"><span>Контакт для связи</span><input name="submitter_contact" value={form.submitter_contact} onChange={updateField} placeholder="@telegram, instagram или пусто" /></label>
          </div>
          <label className="form-field"><span>История</span><textarea name="description" value={form.description} onChange={updateField} rows="5" required placeholder="Напиши историю так, как она должна выглядеть после модерации" /></label>
          <div className="story-submit-bottom">
            <label className="form-field"><span>Фото</span><input type="file" accept="image/*" onChange={handleImage} /></label>
            {form.image_url && <img className="story-submit-preview" src={form.image_url} alt="Предпросмотр истории" />}
          </div>
          {submitMutation.error && <p className="form-error">{submitMutation.error.message}</p>}
          {status && <p className="form-status">{status}</p>}
          <button className="text-button auth-submit" type="submit" disabled={submitMutation.isPending}>
            {submitMutation.isPending ? "Отправляем…" : "Отправить на модерацию"}
          </button>
        </form>
      )}
    </div>
  );
}
