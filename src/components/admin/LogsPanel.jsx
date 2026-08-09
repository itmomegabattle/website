import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminAuditLogs } from "../../services/adminService";
import { ACTION_LABELS } from "./adminConfig";

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
              <strong>{item.actor?.nickname || "Система"} — {ACTION_LABELS[item.action] || "выполнил действие"}</strong>
              <span>{new Date(item.created_at).toLocaleString("ru-RU", { dateStyle: "long", timeStyle: "short" })}</span>
            </div>
            <code>{item.entity_id ? `Объект: ${item.entity_id}` : "Системное действие"}</code>
          </div>
        ))}
      </div>
    </article>
  );
}
