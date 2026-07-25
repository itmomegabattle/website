import { useMemo, useState } from "react";
import LogsPanel from "./admin/LogsPanel";
import PasswordsPanel from "./admin/PasswordsPanel";
import ProfilesPanel from "./admin/ProfilesPanel";
import TagsPanel from "./admin/TagsPanel";
import { ADMIN_TABS } from "./admin/adminConfig";

export default function AdminCabinetPanel() {
  const [activeTab, setActiveTab] = useState("profiles");
  const activeTitle = useMemo(
    () => ADMIN_TABS.find((tab) => tab.id === activeTab)?.label,
    [activeTab],
  );

  return (
    <section className="main-width admin-cabinet admin-shell">
      <div className="admin-section-title">
        <p className="card-kicker">Админ-кабинет</p>
        <h2>{activeTitle}</h2>
      </div>
      <nav className="admin-tabs" aria-label="Разделы админки">
        {ADMIN_TABS.map((tab) => (
          <button
            type="button"
            className={activeTab === tab.id ? "admin-tab admin-tab--active" : "admin-tab"}
            onClick={() => setActiveTab(tab.id)}
            key={tab.id}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      {activeTab === "profiles" && <ProfilesPanel />}
      {activeTab === "tags" && <TagsPanel />}
      {activeTab === "passwords" && <PasswordsPanel />}
      {activeTab === "logs" && <LogsPanel />}
    </section>
  );
}
