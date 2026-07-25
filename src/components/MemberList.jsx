import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Api } from "../api";
import { useAuth } from "../context/AuthContext";
import { isAdminProfile } from "../services/adminService";
import "../styles/member-list.css";
import MemberRoster from "./team/MemberRoster";
import TeamAdminEditor from "./team/TeamAdminEditor";

export default function MemberList() {
  const { profile } = useAuth();
  const [activeFilter, setActiveFilter] = useState("organizers");
  const canEdit = isAdminProfile(profile);
  const organizers = useQuery({ queryKey: ["organizers"], queryFn: Api.getOrganizers, initialData: [] }).data;
  const responsible = useQuery({ queryKey: ["responsible"], queryFn: Api.getResponsible, initialData: [] }).data;
  const activeMembers = activeFilter === "organizers" ? organizers : responsible;

  return (
    <>
      <div className="team-filters">
        <div className="team-toggle" data-filter={activeFilter}>
          <div className="toggle-slider" />
          <button className={`toggle-btn${activeFilter === "organizers" ? " active" : ""}`} type="button" onClick={() => setActiveFilter("organizers")}>Организаторы</button>
          <button className={`toggle-btn${activeFilter === "responsible" ? " active" : ""}`} type="button" onClick={() => setActiveFilter("responsible")}>Ответственные</button>
        </div>
      </div>
      {canEdit && <TeamAdminEditor section={activeFilter} fallbackMembers={activeMembers} />}
      <MemberRoster members={activeMembers} />
    </>
  );
}
