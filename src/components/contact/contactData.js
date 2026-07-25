import { faInstagram, faTelegram, faTiktok, faVk } from "@fortawesome/free-brands-svg-icons";

export const SOCIALS = [
  { id: "card", label: "Визитка", short: "MB" },
  { id: "telegram", label: "Telegram", icon: faTelegram, href: "https://t.me/itmomegabattle" },
  { id: "vk", label: "ВКонтакте", icon: faVk, href: "https://vk.ru/itmomegabattle" },
  { id: "instagram", label: "Instagram", icon: faInstagram, href: "https://www.instagram.com/itmo.megabattle/" },
  { id: "tiktok", label: "TikTok", icon: faTiktok, href: "https://www.tiktok.com/@itmo_megabattle" },
  { id: "rutube", label: "Rutube", short: "RU", href: "https://rutube.ru/channel/78402593/videos/" },
];

export const FALLBACK_STATS = {
  telegram: { followers: 2385 },
  vk: { followers: 5860 },
  instagram: { followers: 1095, posts: 115, following: 4 },
  tiktok: { followers: 169, likes: 1716, posts: 10 },
  rutube: {
    followers: 206,
    posts: 15,
    cover: "https://pic.rtbcdn.ru/userappearance/2026-05-18/5c/7b/5c7b78979571f647d04e15606e1866f6.jpeg",
    videos: [
      {
        title: "ITMO MEGABATTLE 8 сезон 2 раунд",
        thumbnail: "/images/about-image.png",
        url: "https://rutube.ru/channel/78402593/videos/",
      },
      {
        title: "ITMO MEGABATTLE 8 сезон 1 раунд",
        thumbnail: "/images/events/event1.jpg",
        url: "https://rutube.ru/channel/78402593/videos/",
      },
      {
        title: "Гала-концерт ITMO MEGABATTLE",
        thumbnail: "/images/events/event2.jpg",
        url: "https://rutube.ru/channel/78402593/videos/",
      },
    ],
  },
};

export const PROJECT_AVATAR = "/logo.svg";

export const EVENT_STORIES = [
  { title: "Гала", image: "/images/events/event1.jpg" },
  { title: "Раунд", image: "/images/events/event2.jpg" },
  { title: "Актив", image: "/images/about-image.png" },
  { title: "Команда", image: "/images/people/optimized/member-21-small.webp" },
];

const compactNumber = new Intl.NumberFormat("ru-RU", { notation: "compact", maximumFractionDigits: 1 });
const exactNumber = new Intl.NumberFormat("ru-RU");

export function formatSocialStat(value, compact = false) {
  if (!Number.isFinite(value)) return "—";
  return compact ? compactNumber.format(value) : exactNumber.format(value);
}
