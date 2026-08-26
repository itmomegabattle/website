import FacultyExplorer from "./components/FacultyExplorer";
import "./faculties-page.css";

export default function FacultiesPage() {
  return (
    <main className="faculties-page">
      <section id="faculties" className="main-width faculty-explorer-section">
        <h1 className="faculties-title">ФАКУЛЬТЕТЫ</h1>
        <FacultyExplorer />
      </section>
    </main>
  );
}
