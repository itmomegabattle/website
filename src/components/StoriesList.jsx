import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Api } from "../api";
import { useAuth } from "../context/AuthContext";
import { isAdminProfile } from "../services/adminService";
import {
  deleteStory,
  getAdminStories,
  importStaticStories,
  uploadContentImage,
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

function StoryEditor({ fallbackStories }) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [form, setForm] = useState(emptyStory);
  const [status, setStatus] = useState("");

  const { data = [], error } = useQuery({
    queryKey: ["admin-stories"],
    queryFn: getAdminStories,
    enabled: isOpen,
  });

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
                <label className="form-field"><span>Статус</span><select name="status" value={form.status} onChange={updateField}><option value="draft">Черновик</option><option value="published">Опубликовано</option><option value="archived">Архив</option></select></label>
                <label className="form-field"><span>Факультет</span><input name="faculty" value={form.faculty || ""} onChange={updateField} /></label>
                <label className="form-field"><span>Дата</span><input name="story_date_label" value={form.story_date_label || ""} onChange={updateField} /></label>
              </div>
              <label className="form-field"><span>История</span><textarea name="description" value={form.description || ""} onChange={updateField} rows="4" /></label>
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
              {data.map((story) => (
                <div className="stories-admin-row" key={story.id}>
                  <div>
                    <strong>{story.name}</strong>
                    <span>{story.status} · {story.faculty || "без факультета"}</span>
                  </div>
                  <div>
                    <button type="button" onClick={() => setSelectedStory(story)}>Изменить</button>
                    <button type="button" onClick={() => deleteMutation.mutate(story.id)}>Удалить</button>
                  </div>
                </div>
              ))}
              {!data.length && <p>В БД пока пусто. Нажми “Импортировать JSON”, чтобы перенести текущие истории.</p>}
            </div>
          </div>
        </div>
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
  const viewportRef = useRef(null);
  const [pagesCount, setPagesCount] = useState(1);
  const progressMs = 7200;

  const storyPages = useMemo(() => {
    const width = viewportRef.current?.clientWidth || window.innerWidth || 1200;
    const perPage = width >= 1320 ? 5 : width >= 980 ? 4 : width >= 700 ? 3 : width >= 460 ? 2 : 1;
    const pages = [];
    for (let index = 0; index < stories.length; index += perPage) {
      pages.push(stories.slice(index, index + perPage));
    }
    return pages.length ? pages : [[]];
  }, [stories, pagesCount]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(() => {
      setPagesCount((value) => value + 1);
      setPage(0);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (storyPages.length <= 1) return undefined;
    const timer = window.setTimeout(() => {
      setPage((current) => (current + 1) % storyPages.length);
    }, progressMs);
    return () => window.clearTimeout(timer);
  }, [page, storyPages.length]);

  const handleManualPage = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const direction = event.clientX - rect.left > rect.width / 2 ? 1 : -1;
    setPage((current) => (current + direction + storyPages.length) % storyPages.length);
  };

  return (
    <>
      {canEdit && <StoryEditor fallbackStories={stories} />}
      {!stories.length ? null : (
        <div className="stories-carousel" ref={viewportRef}>
          <div className="stories-carousel-window" onClick={handleManualPage} role="button" tabIndex="0" aria-label="Перелистнуть истории">
            {storyPages.map((items, pageIndex) => (
              <div className={`stories-page${pageIndex === page ? " stories-page--active" : ""}`} key={`stories-page-${pageIndex}`}>
                {items.map((story, idx) => (
                  <div className="story-card" key={story.key ?? `${story.name}-${idx}`} data-tag={idx % 3}>
                    <div className="story-image-container">
                      <img src={Api.normalizeURL(story.image)} alt={story.name} className="story-image" />
                    </div>
                    <h3 className="story-name">{story.name}</h3>
                    <p className="story-faculty">{story.faculty}</p>
                    <p className="story-description">{story.description}</p>
                    <p className="story-date">{story.date}</p>
                  </div>
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
        </div>
      )}
    </>
  );
}
