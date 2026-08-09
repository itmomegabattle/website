import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Api } from "../../api";
import {
  deleteFacultyRating,
  getAdminFacultyRatings,
  upsertFacultyRating,
} from "../../services/ratingsService";

const EMPTY_RATING = { name: "", score: 0, badge: "", status: "published" };

function FacultyRatingEditor({ item, onSave, onDelete, isSaving, isDeleting }) {
  const [draft, setDraft] = useState(item);

  useEffect(() => setDraft(item), [item]);

  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value }));

  return (
    <form
      className="faculty-rating-editor"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(draft);
      }}
    >
      <span className="faculty-rating-editor__place">#{item.place}</span>
      <label>
        <span>Факультет</span>
        <input
          value={draft.name}
          maxLength="60"
          onChange={(event) => update("name", event.target.value)}
          required
        />
      </label>
      <label>
        <span>Мегабаллы</span>
        <input
          type="number"
          min="0"
          step="1"
          value={draft.score}
          onChange={(event) => update("score", event.target.value)}
          required
        />
      </label>
      <label>
        <span>Подпись</span>
        <input
          value={draft.badge}
          maxLength="100"
          placeholder="Необязательно"
          onChange={(event) => update("badge", event.target.value)}
        />
      </label>
      <div className="admin-row-actions">
        <button type="submit" disabled={isSaving}>
          {isSaving ? "Сохраняем…" : "Сохранить"}
        </button>
        <button type="button" disabled={isDeleting} onClick={() => onDelete(item)}>
          {isDeleting ? "Удаляем…" : "Удалить"}
        </button>
      </div>
    </form>
  );
}

export default function FacultyRatingsPanel() {
  const queryClient = useQueryClient();
  const [newRating, setNewRating] = useState(EMPTY_RATING);
  const [status, setStatus] = useState("");
  const { data = [], error } = useQuery({
    queryKey: ["admin-faculty-ratings"],
    queryFn: getAdminFacultyRatings,
  });

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-faculty-ratings"] }),
      queryClient.invalidateQueries({ queryKey: ["ratings"] }),
    ]);
  };

  const saveMutation = useMutation({
    mutationFn: upsertFacultyRating,
    onSuccess: async () => {
      setStatus("Таблица обновлена");
      await refresh();
    },
  });
  const createMutation = useMutation({
    mutationFn: upsertFacultyRating,
    onSuccess: async () => {
      setNewRating(EMPTY_RATING);
      setStatus("Строка добавлена");
      await refresh();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteFacultyRating,
    onSuccess: async () => {
      setStatus("Строка удалена");
      await refresh();
    },
  });
  const importMutation = useMutation({
    mutationFn: async () => {
      const current = await Api.getRatings();
      return Promise.all((current.facultyLeaderboard || []).map((item) => upsertFacultyRating({
        ...item,
        sourceKey: `faculty-rating:${String(item.name).toLowerCase().replace(/\s+/g, "-")}`,
        status: "published",
      })));
    },
    onSuccess: async (items) => {
      setStatus(`Перенесено строк: ${items.length}`);
      await refresh();
    },
  });

  const requestDelete = (item) => {
    if (!window.confirm(`Удалить «${item.name}» из рейтинга?`)) return;
    deleteMutation.mutate(item.id);
  };
  const mutationError = saveMutation.error || createMutation.error || deleteMutation.error || importMutation.error;

  return (
    <article className="info-card admin-panel faculty-ratings-panel">
      <div className="admin-panel-head">
        <div>
          <p className="card-kicker">Публичная таблица</p>
          <h2>Мегабаллы</h2>
        </div>
        {!data.length && (
          <button
            className="admin-show-all"
            type="button"
            disabled={importMutation.isPending}
            onClick={() => importMutation.mutate()}
          >
            {importMutation.isPending ? "Переносим…" : "Перенести текущую таблицу"}
          </button>
        )}
      </div>

      <p className="faculty-ratings-panel__hint">
        Места пересчитываются автоматически по количеству мегабаллов. После сохранения изменения сразу попадут в таблицу профиля.
      </p>

      <div className="faculty-rating-editors">
        {data.map((item) => (
          <FacultyRatingEditor
            item={item}
            key={item.id}
            isSaving={saveMutation.isPending && saveMutation.variables?.id === item.id}
            isDeleting={deleteMutation.isPending && deleteMutation.variables === item.id}
            onSave={(draft) => saveMutation.mutate(draft)}
            onDelete={requestDelete}
          />
        ))}
      </div>

      <form
        className="faculty-rating-create"
        onSubmit={(event) => {
          event.preventDefault();
          createMutation.mutate(newRating);
        }}
      >
        <div>
          <p className="card-kicker">Новая строка</p>
          <h3>Добавить факультет</h3>
        </div>
        <label className="form-field">
          <span>Факультет</span>
          <input value={newRating.name} maxLength="60" onChange={(event) => setNewRating((current) => ({ ...current, name: event.target.value }))} required />
        </label>
        <label className="form-field">
          <span>Мегабаллы</span>
          <input type="number" min="0" step="1" value={newRating.score} onChange={(event) => setNewRating((current) => ({ ...current, score: event.target.value }))} required />
        </label>
        <label className="form-field">
          <span>Подпись</span>
          <input value={newRating.badge} maxLength="100" placeholder="Необязательно" onChange={(event) => setNewRating((current) => ({ ...current, badge: event.target.value }))} />
        </label>
        <button className="text-button auth-submit" type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Добавляем…" : "Добавить"}
        </button>
      </form>

      {error && <p className="form-error">{error.message}</p>}
      {mutationError && <p className="form-error">{mutationError.message}</p>}
      {status && <p className="form-status">{status}</p>}
    </article>
  );
}
