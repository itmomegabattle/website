import { useQuery } from "@tanstack/react-query";
import { Api } from "../../../api";
import { useAuth } from "../../../context/AuthContext";
import { isAdminProfile } from "../../../services/adminService";
import StoryEditor from "./stories/StoryEditor";
import StoryProposalForm from "./stories/StoryProposalForm";
import StoriesCarousel from "./stories/StoriesCarousel";
import "./stories-list.css";

export default function StoriesList() {
  const { profile } = useAuth();
  const stories = useQuery({
    queryKey: ["stories"],
    queryFn: Api.getStories,
    placeholderData: [],
  }).data;

  return (
    <>
      {isAdminProfile(profile) && <StoryEditor fallbackStories={stories} />}
      <StoryProposalForm />
      <StoriesCarousel stories={stories} />
    </>
  );
}
