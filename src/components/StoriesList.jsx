import { useQuery } from "@tanstack/react-query";
import { Api } from "../api";
import StoriesCarousel from "./stories/StoriesCarousel";
import "../styles/stories-list.css";

export default function StoriesList() {
  const stories = useQuery({
    queryKey: ["stories"],
    queryFn: Api.getStories,
    placeholderData: [],
  }).data;

  return (
    <>
      <StoriesCarousel stories={stories} />
    </>
  );
}
