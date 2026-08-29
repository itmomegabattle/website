import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Api } from "../api";
import "../styles/member-list.css";
import MemberRoster from "./team/MemberRoster";

export default function MemberList() {
  const [activeFilter, setActiveFilter] = useState(() => (
    new URLSearchParams(window.location.search).get("team") === "responsible" ? "responsible" : "organizers"
  ));
  const organizers = useQuery({ queryKey: ["organizers"], queryFn: Api.getOrganizers, placeholderData: [] }).data;
  const responsible = useQuery({ queryKey: ["responsible"], queryFn: Api.getResponsible, placeholderData: [] }).data;
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
      <MemberRoster members={activeMembers} />
    </>
  );
}
