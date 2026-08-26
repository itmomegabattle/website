export const emptyMember = {
  section: "organizers",
  status: "published",
  source_key: "",
  name: "",
  activity: "",
  role: "",
  description: "",
  links: [],
  small_image_url: "",
  big_image_url: "",
  sort_order: 100,
};

export function linksToText(links = []) {
  return links.map((item) => `${item.text || ""} | ${item.link || ""}`).join("\n");
}

export function textToLinks(value) {
  return value
    .split("\n")
    .map((row) => {
      const [text, link] = row.split("|").map((part) => part?.trim());
      if (!text && !link) return null;
      return { text: text || link, link: link || text };
    })
    .filter(Boolean);
}
