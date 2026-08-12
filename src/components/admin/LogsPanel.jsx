import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminAuditLogs } from "../../services/adminService";
import { ACTION_LABELS, ENTITY_LABELS } from "./adminConfig";

const FIELD_LABELS = {
  nickname: "имя", faculty: "факультет", is_admin: "права администратора",
  is_banned: "статус блокировки", role_badge: "роль", status: "статус",
  name: "название", title: "заголовок", description: "описание", sort_order: "порядок",
};

function getDetails(item) {
  const payload = item.metadata || item.details || item.payload || item.changes;
  if (!payload || typeof payload !== "object") return "";
  const changes = payload.changes || payload.updated_fields || payload.fields || payload;
  const keys = Array.isArray(changes) ? changes : Object.keys(changes).filter((key) => key !== "id");
  if (!keys.length) return "";
  return `Изменено: ${keys.map((key) => FIELD_LABELS[key] || String(key).replaceAll("_", " ")).join(", ")}`;
}

export default function LogsPanel() {
  const [search, setSearch] = useState("");
  const { data = [], error } = useQuery({ queryKey: ["admin-audit-logs"], queryFn: getAdminAuditLogs });
  const visibleLogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    const logs = query
      ? data.filter((item) => `${ACTION_LABELS[item.action] || item.action} ${item.actor?.nickname || ""} ${item.entity_type || ""}`.toLowerCase().includes(query))
      : data;
    return logs.slice(0, 10);
  }, [data, search]);
  const describeAction = (item) => ACTION_LABELS[item.action]
    || `изменил ${ENTITY_LABELS[item.entity_type] || "данные в системе"}`;

  return (
    <article className="info-card admin-panel">
      <div className="admin-panel-head">
        <div><h2>Журнал действий</h2></div>
        <label className="admin-search">
          <span>Поиск</span>
          <input value={search} placeholder="Действие или админ" onChange={(event) => setSearch(event.target.value)} />
        </label>
      </div>
      {error && <p className="form-error">{error.message}</p>}
      <div className="admin-list">
        {visibleLogs.map((item) => (
          <div className="admin-list-row" key={item.id}>
            <div>
              <strong>{item.actor?.nickname || "Система"} — {describeAction(item)}</strong>
              <span>{getDetails(item) || (item.entity_id ? `${ENTITY_LABELS[item.entity_type] || "Запись"}: ${item.entity_id}` : "Системное действие")} · {new Date(item.created_at).toLocaleString("ru-RU", { dateStyle: "long", timeStyle: "short" })}</span>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
