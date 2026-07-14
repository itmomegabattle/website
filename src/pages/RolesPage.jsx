import RoleMap from "../components/RoleMap";
import "../styles/page-info.css";

export default function RolesPage() {
  return (
    <main className="info-page structured-page roles-page">
      <section className="main-width page-title-section roles-title-section">
        <p className="card-kicker">Навигация по команде</p>
        <h1>Роли</h1>
        <p className="info-lead">
          Большой граф помогает понять, куда заходить новичку и как расти внутри
          Megabattle: от реквизита, СММ и помощи на точках — до режиссуры,
          продюсирования, разработки и внешних коммуникаций.
        </p>
      </section>
      <RoleMap />
    </main>
  );
}
