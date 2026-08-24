import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BusinessCard, TelegramProfile, VkProfile } from "./contact/ProjectProfiles";
import { InstagramProfile, RutubeProfile, TiktokProfile } from "./contact/SocialProfiles";
import { FALLBACK_STATS, SOCIALS } from "./contact/contactData";
import RutubeIcon from "../../../common/components/RutubeIcon";
import "./contact-showcase.css";
import { faCamera } from "@fortawesome/free-solid-svg-icons";

export default function ContactShowcase() {
  const [activeTab, setActiveTab] = useState("card");
  const [remoteStats, setRemoteStats] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 6000);

    fetch("/api/social-stats", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => payload?.stats && setRemoteStats(payload.stats))
      .catch(() => {})
      .finally(() => window.clearTimeout(timeout));

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const stats = useMemo(
    () => Object.fromEntries(
      Object.entries(FALLBACK_STATS).map(([key, value]) => [key, { ...value, ...(remoteStats?.[key] || {}) }]),
    ),
    [remoteStats],
  );

  const activeSocial = SOCIALS.find((item) => item.id === activeTab) || SOCIALS[0];

  return (
    <div className={`contact-showcase contact-info contact-showcase--${activeTab}`}>
      <div className="contact-showcase__screen" role="tabpanel" aria-live="polite">
        {activeTab === "card" && <BusinessCard />}
        {activeTab === "telegram" && <TelegramProfile data={stats.telegram} href={activeSocial.href} />}
        {activeTab === "vk" && <VkProfile data={stats.vk} href={activeSocial.href} />}
        {activeTab === "instagram" && <InstagramProfile data={stats.instagram} href={activeSocial.href} />}
        {activeTab === "tiktok" && <TiktokProfile data={stats.tiktok} href={activeSocial.href} />}
        {activeTab === "rutube" && <RutubeProfile data={stats.rutube} href={activeSocial.href} />}
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
            ) : item.id === "rutube" ? (
              <RutubeIcon />
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
