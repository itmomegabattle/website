import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAdminNfcTags, getAdminNfcTags, updateAdminNfcTag } from "../../services/adminService";
import { useAuth } from "../../context/AuthContext";

export default function TagsPanel() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [newTagCount, setNewTagCount] = useState(1);
  const [newTagType, setNewTagType] = useState("card");
  const { data = [], error } = useQuery({ queryKey: ["admin-nfc-tags"], queryFn: getAdminNfcTags });
  const updateMutation = useMutation({
    mutationFn: ({ tagId, values }) => updateAdminNfcTag(tagId, values, profile),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-nfc-tags"] }),
  });
  const createMutation = useMutation({
    mutationFn: () => createAdminNfcTags({ count: Number(newTagCount), tagType: newTagType, labelPrefix: "Метка" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-nfc-tags"] }),
  });

  const visibleTags = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data;
    return data.filter((tag) => (
      String(tag.code || "").toLowerCase().includes(query)
      || String(tag.label || "").toLowerCase().includes(query)
      || String(tag.profile?.nickname || "").toLowerCase().includes(query)
      || String(tag.profile?.isu_number || "").includes(query)
    ));
  }, [data, search]);

  return (
    <article className="info-card admin-panel">
      <div className="admin-panel-head">
        <div><h2>Метки</h2></div>
        <label className="admin-search"><span>Поиск</span><input value={search} placeholder="Код, никнейм, ИСУ" onChange={(event) => setSearch(event.target.value)} /></label>
      </div>
      {error && <p className="form-error">{error.message}</p>}
      <div className="admin-row-actions admin-tag-create">
        <input type="number" min="1" max="500" value={newTagCount} onChange={(event) => setNewTagCount(event.target.value)} aria-label="Количество новых меток" />
        <select value={newTagType} onChange={(event) => setNewTagType(event.target.value)} aria-label="Тип новых меток">
          <option value="keychain">Брелок</option><option value="card">Карта</option><option value="removable">Съёмная</option><option value="sticker">Стикер</option><option value="other">Другое</option>
        </select>
        <button type="button" disabled={createMutation.isPending} onClick={() => createMutation.mutate()}>Создать метки</button>
      </div>
      <div className="admin-list">
        {visibleTags.map((tag) => (
          <div className="admin-list-row admin-tag-row" key={tag.id}>
            <div>
              <strong>{tag.label || "Без названия"}</strong>
              <span>{tag.code} · {tag.tag_type || "метка"} · {tag.is_active ? "активна" : "выключена"}</span>
              <span>Владелец: {tag.profile ? `${tag.profile.nickname} · ИСУ ${tag.profile.isu_number}` : "не привязана"}</span>
            </div>
            <div className="admin-row-actions">
              {tag.profile?.id && <a className="admin-row-link" href={`/u/${tag.profile.id}`} target="_blank" rel="noreferrer">Профиль</a>}
              <button type="button" onClick={() => updateMutation.mutate({ tagId: tag.id, values: { is_active: !tag.is_active } })}>
                {tag.is_active ? "Выключить" : "Включить"}
              </button>
              {tag.profile_id && <button type="button" onClick={() => updateMutation.mutate({ tagId: tag.id, values: { profile_id: null, claimed_at: null } })}>Отвязать</button>}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
