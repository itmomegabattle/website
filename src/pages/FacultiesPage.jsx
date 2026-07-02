import FacultyHistory from "../components/FacultyHistory";
import FacultyMap from "../components/FacultyMap";
import "../styles/page-info.css";

export default function FacultiesPage() {
  return (
    <main className="faculties-page">
      <section id="faculty-map" className="main-width faculty-map-block">
        <h1 className="faculties-title">ФАКУЛЬТЕТЫ</h1>
        <FacultyMap />
      </section>

      <section id="faculty-history" className="main-width faculty-history-section">
        <h1>РЕТРОСПЕКТИВА</h1>
        <FacultyHistory />
      </section>
    </main>
  );
}
