import { useRef } from "react";
import "../styles/page-info.css";

export default function HistoryPage() {
  const pageRef = useRef(null);

  const moveTorch = (event) => {
    const page = pageRef.current;
    if (!page || event.pointerType === "touch") return;

    page.style.setProperty("--torch-x", `${event.clientX}px`);
    page.style.setProperty("--torch-y", `${event.clientY}px`);
    page.dataset.torchActive = "true";
  };

  const hideTorch = () => {
    if (pageRef.current) {
      pageRef.current.dataset.torchActive = "false";
    }
  };

  return (
    <main
      className="info-page structured-page history-page"
      ref={pageRef}
      onPointerMove={moveTorch}
      onPointerLeave={hideTorch}
    >
      <div className="history-torch-cursor" aria-hidden="true">
        <span className="history-torch-cursor__flame" />
        <span className="history-torch-cursor__handle" />
      </div>
      <section className="main-width page-title-section">
        <h1>История</h1>
      </section>
    </main>
  );
}
