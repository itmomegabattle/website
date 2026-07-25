import FriendshipGraphLaunch from "../components/graph/FriendshipGraphLaunch";
import MemberList from "../components/MemberList";
import PeopleCloud from "../components/PeopleCloud";
import StoriesList from "../components/StoriesList";
import "../styles/page-people.css";

export default function PeoplePage() {
  return (
    <main className="people-page">
      <section id="team" className="people-team main-width">
        <h1 className="people-team-title">КОМАНДА</h1>
        <MemberList />
      </section>

      <PeopleCloud />

      <section id="stories" className="stories">
        <h2 className="stories-title">
          <span>ИСТОРИИ</span>
          <span>УЧАСТНИКОВ</span>
        </h2>
        <StoriesList />
      </section>

      <section id="connections" className="people-connections main-width">
        <header className="people-section-heading">
          <div>
            <p className="people-kicker">Живые связи</p>
            <h2>ГРАФ<br />ЗНАКОМСТВ</h2>
          </div>
          <p>
            Карта знакомств участников откроется 29 августа. До запуска тяжёлый
            граф не загружается и не расходует трафик устройства.
          </p>
        </header>
        <FriendshipGraphLaunch />
      </section>
    </main>
  );
}
