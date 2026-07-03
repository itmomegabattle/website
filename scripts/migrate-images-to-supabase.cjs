const fs = require("node:fs");
const path = require("node:path");
const { createClient } = require("@supabase/supabase-js");

const root = path.resolve(__dirname, "..");

function loadEnvFile(fileName) {
  const filePath = path.join(root, fileName);
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Z0-9_]+)=(.*)$/i);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(`
Не хватает переменных окружения.

Добавь в .env.local:

SUPABASE_URL=https://qrvckblzecdtyyoybwtv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=твой_service_role_key

Service role key брать в Supabase:
Project Settings → API → service_role key.

Важно: service_role нельзя класть в Vercel и фронтенд, только локально.
`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const bucketConfigs = [
  { name: "event-images", public: true },
  { name: "team-images", public: true },
  { name: "content-images", public: true },
];

const imageTasks = [
  {
    table: "project_events",
    select: "id, image_url",
    bucket: "event-images",
    folder: "events",
    fields: ["image_url"],
  },
  {
    table: "team_members",
    select: "id, small_image_url, big_image_url",
    bucket: "team-images",
    folder: "team",
    fields: ["small_image_url", "big_image_url"],
  },
  {
    table: "partners",
    select: "id, logo_url",
    bucket: "content-images",
    folder: "partners",
    fields: ["logo_url"],
  },
  {
    table: "participant_stories",
    select: "id, image_url",
    bucket: "content-images",
    folder: "stories",
    fields: ["image_url"],
  },
];

function isLocalImageUrl(value) {
  return typeof value === "string" && value.startsWith("/images/");
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".gif") return "image/gif";
  return "application/octet-stream";
}

function normalizeStoragePath(folder, localUrl) {
  return `${folder}/${localUrl.replace(/^\/images\//, "").replace(/[^a-zA-Z0-9а-яА-ЯёЁ._/-]+/g, "-")}`;
}

async function ensureBuckets() {
  for (const bucket of bucketConfigs) {
    const { error } = await supabase.storage.createBucket(bucket.name, {
      public: bucket.public,
    });

    if (error && !String(error.message).toLowerCase().includes("already exists")) {
      throw error;
    }
  }
}

const uploadCache = new Map();

async function uploadLocalImage({ bucket, folder, localUrl }) {
  const cacheKey = `${bucket}:${localUrl}`;
  if (uploadCache.has(cacheKey)) return uploadCache.get(cacheKey);

  const localPath = path.join(root, "public", localUrl.replace(/^\//, ""));
  if (!fs.existsSync(localPath)) {
    console.warn(`⚠️  Файл не найден: ${localUrl}`);
    return localUrl;
  }

  const storagePath = normalizeStoragePath(folder, localUrl);
  const fileBuffer = fs.readFileSync(localPath);
  const { error } = await supabase.storage.from(bucket).upload(storagePath, fileBuffer, {
    cacheControl: "31536000",
    contentType: getContentType(localPath),
    upsert: true,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  uploadCache.set(cacheKey, data.publicUrl);
  console.log(`✓ ${localUrl} → ${data.publicUrl}`);
  return data.publicUrl;
}

async function migrateTable(task) {
  const { data, error } = await supabase.from(task.table).select(task.select);
  if (error) throw error;

  let updated = 0;
  for (const row of data || []) {
    const patch = {};

    for (const field of task.fields) {
      const value = row[field];
      if (!isLocalImageUrl(value)) continue;
      patch[field] = await uploadLocalImage({
        bucket: task.bucket,
        folder: task.folder,
        localUrl: value,
      });
    }

    if (!Object.keys(patch).length) continue;

    const { error: updateError } = await supabase.from(task.table).update(patch).eq("id", row.id);
    if (updateError) throw updateError;
    updated += 1;
  }

  console.log(`→ ${task.table}: обновлено строк ${updated}`);
}

async function main() {
  console.log("Старт переноса картинок в Supabase Storage…");
  await ensureBuckets();

  for (const task of imageTasks) {
    await migrateTable(task);
  }

  console.log(`
Готово.
Файлы загружены в Supabase Storage, URL обновлены в таблицах:
- project_events.image_url
- team_members.small_image_url / big_image_url
- partners.logo_url
- participant_stories.image_url
`);
}

main().catch((error) => {
  console.error("Ошибка переноса картинок:", error.message);
  process.exit(1);
});
