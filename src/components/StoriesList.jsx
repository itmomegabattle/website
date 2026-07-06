import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Api } from "../api";
import { useAuth } from "../context/AuthContext";
import { isAdminProfile } from "../services/adminService";
import {
  deleteStory,
  getAdminStories,
  importStaticStories,
  submitStoryProposal,
  uploadContentImage,
  uploadStorySubmissionImage,
  upsertStory,
} from "../services/contentService";
import "../styles/stories-list.css";

const emptyStory = {
  status: "published",
  source_key: "",
  name: "",
  faculty: "",
  description: "",
  story_date_label: "",
  image_url: "",
  sort_order: 100,
};

const emptyProposal = {
  name: "",
  faculty: "",
  story_date_label: "",
  description: "",
  image_url: "",
  submitter_contact: "",
};

const storyStatusLabels = {
  draft: "Черновик",
  pending: "На одобрении",
  published: "Опубликовано",
  archived: "Архив",
  rejected: "Отклонено",
};

function StoryEditor({ fallbackStories }) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [previewStory, setPreviewStory] = useState(null);
  const [form, setForm] = useState(emptyStory);
  const [status, setStatus] = useState("");

  const { data = [], error } = useQuery({
    queryKey: ["admin-stories"],
    queryFn: getAdminStories,
    enabled: isOpen,
  });

  const pendingStories = data.filter((story) => story.status === "pending");
  const editableStories = data.filter((story) => story.status !== "pending");

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["stories"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stories"] });
  };

  const saveMutation = useMutation({
    mutationFn: (payload) => upsertStory(payload, profile),
    onSuccess: () => {
      setStatus("История сохранена");
      setSelectedStory(null);
      setForm(emptyStory);
      refresh();
    },
  });
  const deleteMutation = useMutation({ mutationFn: (id) => deleteStory(id, profile), onSuccess: refresh });
  const importMutation = useMutation({
    mutationFn: () => importStaticStories(fallbackStories, profile),
    onSuccess: (items) => {
      setStatus(`Импортировано историй: ${items.length}`);
      refresh();
    },
  });

  useEffect(() => {
    if (!selectedStory) {
      setForm(emptyStory);
      return;
    }

    setForm({
      ...emptyStory,
      ...selectedStory,
    });
  }, [selectedStory]);

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

  const handleSubmit = (event) => {
    event.preventDefault();
    saveMutation.mutate({
      ...form,
      source_key: form.source_key || `${form.name}-${Date.now()}`,
    });
  };

  const reviewStory = (story, nextStatus) => {
    saveMutation.mutate({
      ...story,
      status: nextStatus,
      sort_order: story.sort_order ?? 100,
      source_key: story.source_key || story.key || `story-${story.id}`,
    });
  };

  const openPreview = (story) => {
    setPreviewStory({
      ...story,
      image: story.image_url || story.image || "/images/people/member.jpg",
      date: story.story_date_label || story.date || "",
      description: story.description || "",
      faculty: story.faculty || "",
    });
  };

  return (
    <div className="stories-admin">
      <button className="stories-admin-toggle" type="button" onClick={() => setIsOpen((value) => !value)}>
        {isOpen ? "Скрыть редактор историй" : "Редактировать истории"}
      </button>

      {isOpen && (
        <div className="stories-admin-panel">
          <div className="stories-admin-head">
            <div>
              <p className="card-kicker">Inline admin</p>
              <h2>Истории участников</h2>
            </div>
            <button type="button" onClick={() => importMutation.mutate()} disabled={importMutation.isPending}>
              {importMutation.isPending ? "Импортируем…" : "Импортировать JSON"}
            </button>
          </div>

          <div className="stories-admin-grid">
            <form className="stories-admin-form" onSubmit={handleSubmit}>
              <div className="stories-admin-form-grid">
                <label className="form-field"><span>Имя</span><input name="name" value={form.name} onChange={updateField} required /></label>
                <label className="form-field"><span>Статус</span><select name="status" value={form.status} onChange={updateField}><option value="draft">Черновик</option><option value="pending">На одобрении</option><option value="published">Опубликовано</option><option value="archived">Архив</option><option value="rejected">Отклонено</option></select></label>
                <label className="form-field"><span>Факультет</span><input name="faculty" value={form.faculty || ""} onChange={updateField} /></label>
                <label className="form-field"><span>Дата</span><input name="story_date_label" value={form.story_date_label || ""} onChange={updateField} /></label>
              </div>
              <label className="form-field"><span>История</span><textarea name="description" value={form.description || ""} onChange={updateField} rows="4" /></label>
              <label className="form-field"><span>Контакт автора заявки</span><input name="submitter_contact" value={form.submitter_contact || ""} onChange={updateField} placeholder="@telegram / instagram / комментарий" /></label>
              <div className="stories-admin-form-grid">
                <label className="form-field"><span>Фото</span><input type="file" accept="image/*" onChange={handleImage} /></label>
              </div>
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
                        <button type="button" onClick={() => deleteMutation.mutate(story.id)}>Удалить</button>
                      </div>
                    </div>
                  ))}
                </section>
              )}

              <section className="stories-admin-section">
                <h3>Все истории</h3>
              {editableStories.map((story) => (
                <div className="stories-admin-row" key={story.id}>
                  <div>
                    <strong>{story.name}</strong>
                    <span>{storyStatusLabels[story.status] || story.status} · {story.faculty || "без факультета"}</span>
                  </div>
                  <div>
                    <button type="button" onClick={() => setSelectedStory(story)}>Изменить</button>
                    <button type="button" onClick={() => deleteMutation.mutate(story.id)}>Удалить</button>
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
            <div className="story-image-container story-modal-image">
              <img src={Api.normalizeURL(previewStory.image)} alt={previewStory.name} className="story-image" />
            </div>
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

function StoryProposalForm() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(emptyProposal);
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
        ...emptyProposal,
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

  const handleSubmit = (event) => {
    event.preventDefault();
    submitMutation.mutate(form);
  };

  if (!profile) {
    return (
      <div className="story-submit">
        <a className="story-submit-toggle" href="/auth">Войти и предложить историю</a>
      </div>
    );
  }

  return (
    <div className="story-submit">
      <button className="story-submit-toggle" type="button" onClick={() => setIsOpen((value) => !value)}>
        {isOpen ? "Скрыть форму" : "Предложить историю"}
      </button>

      {isOpen && (
        <form className="story-submit-panel" onSubmit={handleSubmit}>
          <div className="story-submit-head">
            <p className="card-kicker">Истории участников</p>
            <h3>Предложить историю</h3>
          </div>
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

export default function StoriesList() {
  const { profile } = useAuth();
  const canEdit = isAdminProfile(profile);
  const stories = useQuery({
    queryKey: ["stories"],
    queryFn: Api.getStories,
    initialData: [],
  }).data;
  const [page, setPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [openedStory, setOpenedStory] = useState(null);
  const progressMs = 22000;

  const storyPages = useMemo(() => {
    const pages = [];
    for (let index = 0; index < stories.length; index += 4) {
      pages.push(stories.slice(index, index + 4));
    }
    return pages.length ? pages : [[]];
  }, [stories]);

  useEffect(() => {
    setPage(0);
  }, [stories.length]);

  useEffect(() => {
    if (storyPages.length <= 1 || isPaused || openedStory) return undefined;
    const timer = window.setTimeout(() => {
      setPage((current) => (current + 1) % storyPages.length);
    }, progressMs);
    return () => window.clearTimeout(timer);
  }, [isPaused, openedStory, page, storyPages.length]);

  const goToPage = (direction) => {
    setPage((current) => (current + direction + storyPages.length) % storyPages.length);
  };

  return (
    <>
      {canEdit && <StoryEditor fallbackStories={stories} />}
      <StoryProposalForm />
      {!stories.length ? null : (
        <div
          className={`stories-carousel${isPaused || openedStory ? " stories-carousel--paused" : ""}`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          <div className="stories-carousel-window" aria-label="Истории участников">
            {storyPages.map((items, pageIndex) => (
              <div className={`stories-page${pageIndex === page ? " stories-page--active" : ""}`} key={`stories-page-${pageIndex}`}>
                {items.map((story, idx) => (
                  <button
                    className="story-card"
                    key={story.key ?? `${story.name}-${idx}`}
                    data-tag={idx % 3}
                    type="button"
                    onClick={() => setOpenedStory(story)}
                  >
                    <div className="story-image-container">
                      <img src={Api.normalizeURL(story.image)} alt={story.name} className="story-image" />
                    </div>
                    <h3 className="story-name">{story.name}</h3>
                    <p className="story-faculty">{story.faculty}</p>
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className="stories-progress-track" aria-hidden="true">
            <span
              className="stories-progress-fill"
              key={page}
              style={{ "--stories-progress-ms": `${progressMs}ms` }}
            />
          </div>
          <div className="stories-carousel-controls" aria-label="Управление историями">
            <button type="button" onClick={() => goToPage(-1)} aria-label="Предыдущие истории">‹</button>
            <button type="button" onClick={() => goToPage(1)} aria-label="Следующие истории">›</button>
          </div>
          <p className="stories-carousel-hint">Наведи, чтобы остановить · нажми карточку, чтобы открыть</p>
        </div>
      )}
      {openedStory && (
        <div className="story-modal-backdrop" role="presentation" onClick={() => setOpenedStory(null)}>
          <article className="story-modal" role="dialog" aria-modal="true" aria-label={openedStory.name} onClick={(event) => event.stopPropagation()}>
            <button className="story-modal-close" type="button" onClick={() => setOpenedStory(null)} aria-label="Закрыть историю">×</button>
            <div className="story-image-container story-modal-image">
              <img src={Api.normalizeURL(openedStory.image)} alt={openedStory.name} className="story-image" />
            </div>
            <h2>{openedStory.name}</h2>
            <p className="story-faculty">{openedStory.faculty}</p>
            <p className="story-modal-description">{openedStory.description}</p>
            <p className="story-date">{openedStory.date}</p>
          </article>
        </div>
      )}
    </>
  );
}
