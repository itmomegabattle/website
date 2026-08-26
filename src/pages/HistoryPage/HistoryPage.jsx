import { useQuery } from "@tanstack/react-query";
import { Api } from "../../api";
import HistoryExperience from "./components/HistoryExperience";
import "./history-page.css";

export default function HistoryPage() {
  const history = useQuery({
    queryKey: ["history"],
    queryFn: Api.getHistory,
    placeholderData: { chapters: [], archive: [] },
  }).data;

  return (
    <main className="history-page">
      <HistoryExperience data={history} />
    </main>
  );
}
