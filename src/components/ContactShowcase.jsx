import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BusinessCard, TelegramProfile, VkProfile } from "./contact/ProjectProfiles";
import { InstagramProfile, TiktokProfile } from "./contact/SocialProfiles";
import { FALLBACK_STATS, SOCIALS } from "./contact/contactData";
import "../styles/contact-showcase.css";
import { faCamera } from "@fortawesome/free-solid-svg-icons";

export default function ContactShowcase() {
  const [activeTab, setActiveTab] = useState("card");
  const stats = FALLBACK_STATS;

  const activeSocial = SOCIALS.find((item) => item.id === activeTab) || SOCIALS[0];

  return (
    <div className={`contact-showcase contact-info contact-showcase--${activeTab}`}>
      <div className="contact-showcase__screen" role="tabpanel" aria-live="polite">
        {activeTab === "card" && <BusinessCard />}
        {activeTab === "telegram" && <TelegramProfile data={stats.telegram} href={activeSocial.href} />}
        {activeTab === "vk" && <VkProfile data={stats.vk} href={activeSocial.href} />}
        {activeTab === "instagram" && <InstagramProfile data={stats.instagram} href={activeSocial.href} />}
        {activeTab === "tiktok" && <TiktokProfile data={stats.tiktok} href={activeSocial.href} />}
      </div>
      <div className="contact-tabs" role="tablist" aria-label="Контакты и социальные сети">
        {SOCIALS.map((item) => (
          <button
            className={`contact-tab contact-tab--${item.id}${activeTab === item.id ? " is-active" : ""}`}
            key={item.id}
            type="button"
            role="tab"
            aria-selected={activeTab === item.id}
            aria-label={item.label}
            title={item.label}
            onClick={() => setActiveTab(item.id)}
          >
            {item.id === "instagram" ? (
              <FontAwesomeIcon icon={faCamera} />
            ) : item.icon ? (
              <FontAwesomeIcon icon={item.icon} />
            ) : (
              <span>{item.short}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
