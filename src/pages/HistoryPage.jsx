import { useEffect, useState } from "react";
import { Api } from "../api";
import HistoryExperience from "../components/history/HistoryExperience";
import "../styles/page-history.css";

export default function HistoryPage() {
  const [history, setHistory] = useState({ chapters: [], archive: [] });

  useEffect(() => {
    let active = true;
    Api.getHistory()
      .then((result) => {
        if (active) setHistory(result);
      })
      .catch(() => {
        if (active) setHistory({ chapters: [], archive: [] });
      });
    return () => { active = false; };
  }, []);

  return (
    <main className="history-page">
      <HistoryExperience data={history} />
    </main>
  );
}
