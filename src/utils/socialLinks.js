export function normalizeHandle(value) {
  return String(value || "").replace(/^@/, "").trim();
}

export function normalizeSocialUrl(value, prefix = "") {
  if (!value) return "";
  const clean = normalizeHandle(value);
  if (clean.startsWith("http")) return clean;
  return `${prefix}${clean}`;
}

export function getSocialBrand(item) {
  const title = String(item?.title || "").toLowerCase();
  const url = String(item?.url || "").toLowerCase();

  if (title.includes("telegram") || title.includes("тг") || url.includes("t.me") || url.includes("telegram")) {
    return "telegram";
  }

  if (title.includes("instagram") || title.includes("инста") || url.includes("instagram.com")) {
    return "instagram";
  }

  if (title.includes("vk") || title.includes("вк") || url.includes("vk.com")) {
    return "vk";
  }

  if (title.includes("github") || url.includes("github.com")) {
    return "github";
  }

  return "custom";
}

export function getProfileSocialLinks(profile) {
  const links = [];
  const telegram = normalizeSocialUrl(profile?.telegram_username, "https://t.me/");
  const instagram = normalizeSocialUrl(profile?.instagram_username, "https://instagram.com/");

  if (telegram) {
    links.push({
      title: "Telegram",
      url: telegram,
      brand: "telegram",
      style: "solid",
    });
  }

  if (instagram) {
    links.push({
      title: "Instagram",
      url: instagram,
      brand: "instagram",
      style: "solid",
    });
  }

  profile?.social_links
    ?.filter((item) => item.title && item.url)
    .forEach((item) => {
      links.push({
        ...item,
        brand: getSocialBrand(item),
        style: item.style || "soft",
        color: item.color || "",
      });
    });

  return links;
}

export function getSocialLinkStyle(item) {
  const brandColors = {
    telegram: "#229ED9",
    instagram: "#E4405F",
    vk: "#0077FF",
    github: "#8BA5FF",
  };
  const color = item.color || brandColors[item.brand] || "#8BA5FF";

  return {
    "--social-color": color,
  };
}
