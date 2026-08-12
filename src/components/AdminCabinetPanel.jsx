import { useState } from "react";
import LogsPanel from "./admin/LogsPanel";
import PasswordsPanel from "./admin/PasswordsPanel";
import ProfilesPanel from "./admin/ProfilesPanel";
import TagsPanel from "./admin/TagsPanel";
import FacultyRatingsPanel from "./admin/FacultyRatingsPanel";
import SupportPanel from "./admin/SupportPanel";
import { ADMIN_TABS } from "./admin/adminConfig";

export default function AdminCabinetPanel() {
  const [activeTab, setActiveTab] = useState("ratings");

  return (
    <section className="main-width admin-cabinet admin-shell">
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
      {activeTab === "ratings" && <FacultyRatingsPanel />}
      {activeTab === "profiles" && <ProfilesPanel />}
      {activeTab === "tags" && <TagsPanel />}
      {activeTab === "passwords" && <PasswordsPanel />}
      {activeTab === "support" && <SupportPanel />}
      {activeTab === "logs" && <LogsPanel />}
    </section>
  );
}
