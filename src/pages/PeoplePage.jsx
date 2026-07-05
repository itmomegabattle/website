import Megabattle from "../components/Megabattle";
import MemberList from "../components/MemberList";
import StoriesList from "../components/StoriesList";
import "../styles/page-people.css";

export default function PeoplePage() {
  return (
    <main>
      <section className="main-width">
        {/* todo: скучновато */}
        <Megabattle className="people-title" />
      </section>

      <section id="team" className="team" >
        <h1>КОМАНДА</h1>
        <MemberList />
      </section>

      <section id="stories" className="stories">
        <h1 className="stories-title">
          <span>ИСТОРИИ</span>
          <span>УЧАСТНИКОВ</span>
        </h1>
        <StoriesList />
      </section>
    </main>
  );
}
