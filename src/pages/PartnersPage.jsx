import { ExternalPrCards, ExternalPrContact } from "../components/ExternalPrSections";
import PartnersBento from "../components/PartnersBento";
import "../styles/page-info.css";

export default function PartnersPage() {
  return (
    <main className="info-page structured-page partners-page">
      <section className="partners-page-section">
        <h1>Партнёры</h1>
        <PartnersBento />
      </section>

      <section className="main-width partnership-formats-section">
        <h1>Форматы</h1>
        <p className="partnership-section-lead">
          От одного события до целого сезона — собираем партнёрство под задачу бренда и интересы участников.
        </p>
        <ExternalPrCards />
      </section>

      <section className="main-width partnership-contact-section">
        <ExternalPrContact />
      </section>
    </main>
  );
}
