import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Api } from "../api";
import { useAuth } from "../context/AuthContext";
import { isAdminProfile } from "../services/adminService";
import "../styles/member-list.css";
import MemberRoster from "./team/MemberRoster";
import TeamAdminEditor from "./team/TeamAdminEditor";
import TeamToggle from "./team/TeamToggle";

export default function MemberList() {
  const { profile } = useAuth();
  const [activeFilter, setActiveFilter] = useState(() => (
    new URLSearchParams(window.location.search).get("team") === "responsible" ? "responsible" : "organizers"
  ));
  const canEdit = isAdminProfile(profile);
  const organizers = useQuery({ queryKey: ["organizers"], queryFn: Api.getOrganizers, placeholderData: [] }).data;
  const responsible = useQuery({ queryKey: ["responsible"], queryFn: Api.getResponsible, placeholderData: [] }).data;
  const activeMembers = activeFilter === "organizers" ? organizers : responsible;

  return (
    <>
      <TeamToggle value={activeFilter} onChange={setActiveFilter} />
      {canEdit && <TeamAdminEditor section={activeFilter} fallbackMembers={activeMembers} />}
      <MemberRoster section={activeFilter} members={activeMembers} />
    </>
  );
}
