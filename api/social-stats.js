const REQUEST_TIMEOUT_MS = 4500;

async function fetchText(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; ITMOMegabattle/1.0; +https://megabattle.itmo.ru)",
        accept: "text/html,application/json",
        ...(options.headers || {}),
      },
    });

    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function numberFromMatch(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match?.[1]) continue;
    const value = Number(match[1].replace(/[^0-9]/g, ""));
    if (Number.isFinite(value)) return value;
  }
  return null;
}

function defined(values) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => Number.isFinite(value)));
}

async function telegramStats() {
  const html = await fetchText("https://t.me/itmomegabattle");
  return defined({
    followers: numberFromMatch(html, [/<div class="tgme_page_extra">\s*([\d\s.,]+)\s+(?:subscribers|members)/i]),
  });
}

async function instagramStats() {
  const html = await fetchText("https://www.instagram.com/itmo.megabattle/");
  return defined({
    followers: numberFromMatch(html, [/(?:content="|>)([\d,.\s]+)\s+Followers/i]),
    posts: numberFromMatch(html, [/([\d,.\s]+)\s+Posts/i]),
    following: numberFromMatch(html, [/([\d,.\s]+)\s+Following/i]),
  });
}

async function tiktokStats() {
  const html = await fetchText("https://www.tiktok.com/@itmo_megabattle");
  return defined({
    followers: numberFromMatch(html, [/"followerCount":\s*(\d+)/]),
    likes: numberFromMatch(html, [/"heartCount":\s*(\d+)/]),
    posts: numberFromMatch(html, [/"videoCount":\s*(\d+)/]),
  });
}

async function rutubeStats() {
  const html = await fetchText("https://rutube.ru/channel/78402593/videos/");
  return defined({
    followers: numberFromMatch(html, [/"subscribers_count":\s*(\d+)/, /([\d\s]+)\s+подписчик/i]),
    posts: numberFromMatch(html, [/"video_count":\s*(\d+)/, /"videos_count":\s*(\d+)/]),
  });
}

async function vkStats() {
  if (!process.env.VK_SERVICE_TOKEN) return {};
  const url = new URL("https://api.vk.com/method/groups.getById");
  url.searchParams.set("group_id", "itmomegabattle");
  url.searchParams.set("fields", "members_count");
  url.searchParams.set("v", "5.199");
  url.searchParams.set("access_token", process.env.VK_SERVICE_TOKEN);

  const payload = JSON.parse(await fetchText(url.toString(), { headers: { accept: "application/json" } }));
  const group = Array.isArray(payload.response) ? payload.response[0] : payload.response?.groups?.[0];
  return defined({ followers: Number(group?.members_count) });
}

async function safe(loader) {
  try {
    return await loader();
  } catch {
    return {};
  }
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const [telegram, vk, instagram, tiktok, rutube] = await Promise.all([
    safe(telegramStats),
    safe(vkStats),
    safe(instagramStats),
    safe(tiktokStats),
    safe(rutubeStats),
  ]);

  response.setHeader("Cache-Control", "public, s-maxage=21600, stale-while-revalidate=86400");
  return response.status(200).json({
    stats: { telegram, vk, instagram, tiktok, rutube },
    updatedAt: new Date().toISOString(),
  });
};
