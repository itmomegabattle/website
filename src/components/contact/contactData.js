import { faInstagram, faTelegram, faTiktok, faVk } from "@fortawesome/free-brands-svg-icons";

export const SOCIALS = [
  { id: "card", label: "Визитка", short: "MB" },
  { id: "telegram", label: "Telegram", icon: faTelegram, href: "https://t.me/itmomegabattle" },
  { id: "vk", label: "ВКонтакте", icon: faVk, href: "https://vk.ru/itmomegabattle" },
  { id: "instagram", label: "Instagram", icon: faInstagram, href: "https://www.instagram.com/itmo.megabattle/" },
  { id: "tiktok", label: "TikTok", icon: faTiktok, href: "https://www.tiktok.com/@itmo_megabattle" },
];

export const FALLBACK_STATS = {
  telegram: { followers: 2385 },
  vk: { followers: 5860 },
  instagram: { followers: 1095, posts: 115, following: 4 },
  tiktok: { followers: 169, likes: 1716, posts: 10 },
};

export const PROJECT_AVATAR = "/logo.svg";

export const EVENT_STORIES = [
  { title: "Гала", image: "/images/events/event1.webp" },
  { title: "Раунд", image: "/images/events/event2.webp" },
  { title: "Актив", image: "/images/about-image.webp" },
  { title: "Команда", image: "/images/people/optimized/member-21-small.webp" },
];

const compactNumber = new Intl.NumberFormat("ru-RU", { notation: "compact", maximumFractionDigits: 1 });
const exactNumber = new Intl.NumberFormat("ru-RU");

export function formatSocialStat(value, compact = false) {
  if (!Number.isFinite(value)) return "—";
  return compact ? compactNumber.format(value) : exactNumber.format(value);
}
