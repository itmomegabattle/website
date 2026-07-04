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

      <section className="main-width">
        <h1>Форматы</h1>
        <ExternalPrCards />
      </section>

      <section className="main-width">
        <ExternalPrContact />
      </section>
    </main>
  );
}
