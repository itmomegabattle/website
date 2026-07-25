import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import {
  deleteStory,
  getAdminStories,
  importStaticStories,
  uploadContentImage,
  upsertStory,
} from "../../services/contentService";
import { EMPTY_STORY, STORY_STATUS_LABELS } from "./storyConfig";

export default function StoryEditor({ fallbackStories }) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [previewStory, setPreviewStory] = useState(null);
  const [form, setForm] = useState(EMPTY_STORY);
  const [status, setStatus] = useState("");
  const { data = [], error } = useQuery({ queryKey: ["admin-stories"], queryFn: getAdminStories, enabled: isOpen });
  const pendingStories = data.filter((story) => story.status === "pending");
  const editableStories = data.filter((story) => story.status !== "pending");
  const refresh = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: ["stories"] }),
    queryClient.invalidateQueries({ queryKey: ["admin-stories"] }),
  ]);
  const saveMutation = useMutation({
    mutationFn: (payload) => upsertStory(payload, profile),
    onSuccess: () => {
      setStatus("История сохранена");
      setSelectedStory(null);
      setForm(EMPTY_STORY);
      refresh();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteStory(id, profile),
    onSuccess: async (_, deletedId) => {
      if (selectedStory?.id === deletedId) setSelectedStory(null);
      if (previewStory?.id === deletedId) setPreviewStory(null);
      setStatus("История удалена");
      await refresh();
    },
  });
  const importMutation = useMutation({
    mutationFn: () => importStaticStories(fallbackStories, profile),
    onSuccess: (items) => {
      setStatus(`Импортировано историй: ${items.length}`);
      refresh();
    },
  });

  useEffect(() => setForm(selectedStory ? { ...EMPTY_STORY, ...selectedStory } : EMPTY_STORY), [selectedStory]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };
  const handleImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus("Загружаем фото…");
    const imageUrl = await uploadContentImage(file, "stories");
    setForm((current) => ({ ...current, image_url: imageUrl }));
    setStatus("Фото загружено");
  };
  const reviewStory = (story, nextStatus) => saveMutation.mutate({
    ...story,
    status: nextStatus,
    sort_order: story.sort_order ?? 100,
    source_key: story.source_key || story.key || `story-${story.id}`,
  });
  const openPreview = (story) => setPreviewStory({
    ...story,
    image: story.image_url || story.image || "/images/people/member.jpg",
    date: story.story_date_label || story.date || "",
    description: story.description || "",
    faculty: story.faculty || "",
  });
  const requestDelete = (story) => {
    if (!window.confirm(`Удалить историю «${story.name}»? Это действие нельзя отменить.`)) return;
    setStatus("");
    deleteMutation.mutate(story.id);
  };

  return (
    <div className="stories-admin">
      <button className="stories-admin-toggle" type="button" onClick={() => setIsOpen((value) => !value)}>
        {isOpen ? "Скрыть редактор историй" : "Редактировать истории"}
      </button>
      {isOpen && (
        <div className="stories-admin-panel">
          <div className="stories-admin-head">
            <div><p className="card-kicker">Inline admin</p><h2>Истории участников</h2></div>
            <button type="button" onClick={() => importMutation.mutate()} disabled={importMutation.isPending}>
              {importMutation.isPending ? "Импортируем…" : "Импортировать JSON"}
            </button>
          </div>
          <div className="stories-admin-grid">
            <form
              className="stories-admin-form"
              onSubmit={(event) => {
                event.preventDefault();
                saveMutation.mutate({ ...form, source_key: form.source_key || `${form.name}-${Date.now()}` });
              }}
            >
              <div className="stories-admin-form-grid">
                <label className="form-field"><span>Имя</span><input name="name" value={form.name} onChange={updateField} required /></label>
                <label className="form-field"><span>Статус</span><select name="status" value={form.status} onChange={updateField}><option value="draft">Черновик</option><option value="pending">На одобрении</option><option value="published">Опубликовано</option><option value="archived">Архив</option><option value="rejected">Отклонено</option></select></label>
                <label className="form-field"><span>Факультет</span><input name="faculty" value={form.faculty || ""} onChange={updateField} /></label>
                <label className="form-field"><span>Дата</span><input name="story_date_label" value={form.story_date_label || ""} onChange={updateField} /></label>
              </div>
              <label className="form-field"><span>История</span><textarea name="description" value={form.description || ""} onChange={updateField} rows="4" /></label>
              <label className="form-field"><span>Контакт автора заявки</span><input name="submitter_contact" value={form.submitter_contact || ""} onChange={updateField} placeholder="@telegram / instagram / комментарий" /></label>
              <div className="stories-admin-form-grid"><label className="form-field"><span>Фото</span><input type="file" accept="image/*" onChange={handleImage} /></label></div>
              {error && <p className="form-error">{error.message}</p>}
              {saveMutation.error && <p className="form-error">{saveMutation.error.message}</p>}
              {deleteMutation.error && <p className="form-error">{deleteMutation.error.message}</p>}
              {status && <p className="form-status">{status}</p>}
              <button className="text-button auth-submit" type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Сохраняем…" : selectedStory ? "Сохранить изменения" : "Добавить историю"}
              </button>
            </form>
            <div className="stories-admin-list">
              {pendingStories.length > 0 && (
                <section className="stories-admin-section">
                  <h3>На одобрении</h3>
                  {pendingStories.map((story) => (
                    <div className="stories-admin-row stories-admin-row--pending" key={story.id}>
                      <div className="stories-admin-request">
                        <img src={Api.normalizeURL(story.image_url || "/images/people/member.jpg")} alt={story.name} />
                        <div>
                          <strong>{story.name}</strong>
                          <span>{story.faculty || "без факультета"} · {story.story_date_label || "без даты"}</span>
                          {story.submitter_contact && <span>Контакт: {story.submitter_contact}</span>}
                          {story.description && <p>{story.description}</p>}
                        </div>
                      </div>
                      <div className="stories-admin-actions">
                        <button type="button" onClick={() => reviewStory(story, "published")}>Одобрить</button>
                        <button type="button" onClick={() => reviewStory(story, "rejected")}>Отклонить</button>
                        <button type="button" onClick={() => openPreview(story)}>Предпросмотр</button>
                        <button type="button" onClick={() => setSelectedStory(story)}>Изменить</button>
                        <button type="button" onClick={() => requestDelete(story)} disabled={deleteMutation.isPending}>
                          {deleteMutation.isPending && deleteMutation.variables === story.id ? "Удаляем…" : "Удалить"}
                        </button>
                      </div>
                    </div>
                  ))}
                </section>
              )}
              <section className="stories-admin-section">
                <h3>Все истории</h3>
                {editableStories.map((story) => (
                  <div className="stories-admin-row" key={story.id}>
                    <div><strong>{story.name}</strong><span>{STORY_STATUS_LABELS[story.status] || story.status} · {story.faculty || "без факультета"}</span></div>
                    <div>
                      <button type="button" onClick={() => setSelectedStory(story)}>Изменить</button>
                      <button type="button" onClick={() => requestDelete(story)} disabled={deleteMutation.isPending}>
                        {deleteMutation.isPending && deleteMutation.variables === story.id ? "Удаляем…" : "Удалить"}
                      </button>
                    </div>
                  </div>
                ))}
              </section>
              {!data.length && <p>В БД пока пусто. Нажми “Импортировать JSON”, чтобы перенести текущие истории.</p>}
            </div>
          </div>
        </div>
      )}
      {previewStory && (
        <div className="story-modal-backdrop" role="presentation" onClick={() => setPreviewStory(null)}>
          <article className="story-modal story-modal--admin-preview" role="dialog" aria-modal="true" aria-label={`Предпросмотр: ${previewStory.name}`} onClick={(event) => event.stopPropagation()}>
            <button className="story-modal-close" type="button" onClick={() => setPreviewStory(null)} aria-label="Закрыть предпросмотр">×</button>
            <p className="card-kicker">Предпросмотр публикации</p>
            <div className="story-image-container story-modal-image"><img src={Api.normalizeURL(previewStory.image)} alt={previewStory.name} className="story-image" /></div>
            <h2>{previewStory.name}</h2>
            <p className="story-faculty">{previewStory.faculty || "без факультета"}</p>
            <p className="story-modal-description">{previewStory.description}</p>
            <p className="story-date">{previewStory.date || "без даты"}</p>
            <div className="story-preview-actions">
              <button type="button" onClick={() => reviewStory(previewStory, "published")}>Одобрить</button>
              <button type="button" onClick={() => setPreviewStory(null)}>Закрыть</button>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
