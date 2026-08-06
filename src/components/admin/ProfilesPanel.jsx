import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteAdminProfile, getAdminProfiles, updateAdminProfile } from "../../services/adminService";
import { useAuth } from "../../context/AuthContext";

export default function ProfilesPanel() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [roleDrafts, setRoleDrafts] = useState({});
  const [megaballDrafts, setMegaballDrafts] = useState({});
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const { data: profileResult = { items: [], total: 0 }, error } = useQuery({
    queryKey: ["admin-profiles", search.trim(), showAll],
    queryFn: () => getAdminProfiles({ search, all: showAll }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ profileId, values }) => updateAdminProfile(profileId, values, profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["ratings"] });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (profileId) => deleteAdminProfile(profileId, profile),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-profiles"] }),
  });

  const visibleProfiles = useMemo(
    () => [...profileResult.items].sort((first, second) => String(first.nickname || "").localeCompare(String(second.nickname || ""), "ru")),
    [profileResult.items],
  );
  const getRoleValue = (item) => roleDrafts[item.id] ?? item.role_badge ?? "";
  const getMegaballValue = (item) => megaballDrafts[item.id] ?? item.megaballs ?? 0;
  const saveProfileScore = (item) => {
    updateMutation.mutate({
      profileId: item.id,
      values: {
        role_badge: getRoleValue(item).trim() || null,
        megaballs: Math.max(0, Number(getMegaballValue(item)) || 0),
      },
    });
  };
  const requestProfileDelete = (item) => {
    if (!window.confirm(`Удалить профиль «${item.nickname || "без имени"}» и связанные с ним данные?`)) return;
    deleteMutation.mutate(item.id);
  };

  return (
    <article className="info-card admin-panel">
      <div className="admin-panel-head">
        <div><p className="card-kicker">Роли и модерация</p><h2>Участники</h2></div>
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
            <label className="admin-role-field">
              <span>Роль / метка</span>
              <input
                value={getRoleValue(item)}
                placeholder="Ведущий, фотограф, лучший мемолог…"
                onChange={(event) => setRoleDrafts((current) => ({ ...current, [item.id]: event.target.value }))}
              />
            </label>
            <label className="admin-role-field admin-megaballs-field">
              <span>Мегабаллы</span>
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={getMegaballValue(item)}
                onChange={(event) => setMegaballDrafts((current) => ({ ...current, [item.id]: event.target.value }))}
              />
            </label>
            <div className="admin-row-actions">
              <a className="admin-row-link" href={`/u/${item.id}`} target="_blank" rel="noreferrer">Профиль</a>
              <button type="button" onClick={() => saveProfileScore(item)}>Сохранить</button>
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
              <button type="button" onClick={() => requestProfileDelete(item)} disabled={deleteMutation.isPending}>
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
