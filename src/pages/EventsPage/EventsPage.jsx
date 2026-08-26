import EventSections from "./components/EventSections";
import "../../styles/page-info.css";
import "./events-page.css";

export default function EventsPage() {
  return (
    <main className="info-page structured-page events-page">
      <EventSections />
    </main>
  );
}
