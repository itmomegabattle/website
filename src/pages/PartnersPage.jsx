import { ExternalPrCards, ExternalPrContact } from "../components/ExternalPrSections";
import PartnersBento from "../components/PartnersBento";
import "../styles/page-info.css";

export default function PartnersPage() {
  return (
    <main className="info-page structured-page partners-page">
      <section className="info-hero main-width">
        <p className="eyebrow">Внешний пиар</p>
        <h1>Партнёрка и внешние интеграции</h1>
        <p className="info-lead">
          Отдельная витрина для партнёров Megabattle: кто с нами, какие форматы
          доступны и куда писать, если хочется присоединиться.
        </p>
      </section>

      <section className="main-width">
        <h1>Форматы партнёрства</h1>
        <ExternalPrCards />
      </section>

      <section className="partners-page-section">
        <h1>Партнёры</h1>
        <PartnersBento />
      </section>

      <section className="main-width">
        <ExternalPrContact />
      </section>
    </main>
  );
}
