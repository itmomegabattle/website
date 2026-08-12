import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteAdminProfile, getAdminProfiles, updateAdminProfile } from "../../services/adminService";
import { useAuth } from "../../context/AuthContext";

export default function ProfilesPanel() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const { data: profileResult = { items: [], total: 0 }, error } = useQuery({
    queryKey: ["admin-profiles", search.trim(), showAll],
    queryFn: () => getAdminProfiles({ search, all: showAll }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ profileId, values }) => updateAdminProfile(profileId, values, profile),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-profiles"] }),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteAdminProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-profiles"] }),
  });
  const requestDelete = (item) => {
    if (!window.confirm(`Удалить участника «${item.nickname}»? Это действие нельзя отменить.`)) return;
    deleteMutation.mutate(item.id);
  };

  const visibleProfiles = useMemo(
    () => [...profileResult.items].sort((first, second) => String(first.nickname || "").localeCompare(String(second.nickname || ""), "ru")),
    [profileResult.items],
  );
  return (
    <article className="info-card admin-panel">
      <div className="admin-panel-head">
        <div><h2>Участники</h2></div>
        <label className="admin-search">
          <span>Поиск</span>
          <input value={search} placeholder="Никнейм или ИСУ" onChange={(event) => setSearch(event.target.value)} />
        </label>
      </div>
      {error && <p className="form-error">{error.message}</p>}
      <div className="admin-table">
        {visibleProfiles.map((item) => (
          <div className={`admin-list-row admin-list-row--profile admin-profile-row${item.is_banned ? " admin-profile-row--banned" : ""}`} key={item.id}>
            <div>
              <strong>{item.nickname}</strong>
              <span>
                ИСУ {item.isu_number} · {item.faculty || "без фака"}
                {item.is_banned ? " · БАН" : ""}
                {item.is_admin ? " · админ" : ""}
              </span>
            </div>
            <div className="admin-row-actions">
              <a className="admin-row-link" href={`/u/${item.id}`} target="_blank" rel="noreferrer">Профиль</a>
              <button type="button" onClick={() => updateMutation.mutate({ profileId: item.id, values: { is_admin: !item.is_admin } })}>
                {item.is_admin ? "Убрать админа" : "Сделать админом"}
              </button>
              <button
                className={item.is_banned ? "admin-danger-button admin-danger-button--active" : "admin-danger-button"}
                type="button"
                onClick={() => updateMutation.mutate({ profileId: item.id, values: { is_banned: !item.is_banned } })}
              >
                {item.is_banned ? "Разбанить" : "Бан"}
              </button>
              <button
                className="admin-danger-button"
                type="button"
                disabled={deleteMutation.isPending && deleteMutation.variables === item.id}
                onClick={() => requestDelete(item)}
              >
                {deleteMutation.isPending && deleteMutation.variables === item.id ? "Удаляем…" : "Удалить"}
              </button>
            </div>
          </div>
        ))}
      </div>
      {!search.trim() && profileResult.total > 10 && (
        <button className="admin-show-all" type="button" onClick={() => setShowAll((value) => !value)}>
          {showAll ? "Показать первые 10" : `Открыть весь список (${profileResult.total})`}
        </button>
      )}
    </article>
  );
}
