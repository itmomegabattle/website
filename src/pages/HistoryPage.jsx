import { useEffect, useRef, useState } from "react";
import { Api } from "../api";
import HistoryExperience from "../components/history/HistoryExperience";
import "../styles/page-history.css";

export default function HistoryPage() {
  const pageRef = useRef(null);
  const [history, setHistory] = useState({ chapters: [], archive: [] });

  useEffect(() => {
    let active = true;
    Api.getHistory()
      .then((data) => active && setHistory(data))
      .catch(() => active && setHistory({ chapters: [], archive: [] }));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const page = pageRef.current;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!page || !finePointer.matches) return undefined;

    const moveTorch = (event) => {
      if (event.pointerType === "touch") return;
      page.style.setProperty("--torch-x", `${event.clientX}px`);
      page.style.setProperty("--torch-y", `${event.clientY}px`);
      page.dataset.torchActive = "true";
    };
    const hideTorch = () => { page.dataset.torchActive = "false"; };

    document.documentElement.classList.add("history-cursor-mode");
    window.addEventListener("pointermove", moveTorch, { passive: true });
    window.addEventListener("pointerdown", moveTorch, { passive: true });
    window.addEventListener("blur", hideTorch);
    document.addEventListener("mouseleave", hideTorch);

    return () => {
      document.documentElement.classList.remove("history-cursor-mode");
      window.removeEventListener("pointermove", moveTorch);
      window.removeEventListener("pointerdown", moveTorch);
      window.removeEventListener("blur", hideTorch);
      document.removeEventListener("mouseleave", hideTorch);
    };
  }, []);

  return (
    <main
      className="history-page"
      ref={pageRef}
    >
      <div className="history-torch-cursor" aria-hidden="true">
        <span className="history-torch-cursor__flame" />
        <span className="history-torch-cursor__handle" />
      </div>
      <HistoryExperience data={history} />
    </main>
  );
}
