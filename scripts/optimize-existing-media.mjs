import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APPLY = process.argv.includes("--apply");
const DELETE_ORIGINALS = process.argv.includes("--delete-originals");
const REPORT_DIR = path.join(ROOT, "docs", "media-migrations");
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "avif", "tif", "tiff"]);
const TABLE_FIELDS = {
  profiles: ["avatar_url"],
  team_members: ["small_image_url", "big_image_url"],
  participant_stories: ["image_url"],
  partners: ["logo_url"],
  project_events: ["image_url"],
  achievements: ["icon_url"],
  currencies: ["icon_url"],
};

try {
  process.loadEnvFile(path.join(ROOT, ".env.local"));
} catch {
  // CI/production can provide the variables directly.
}

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Нужны SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function extensionOf(name) {
  return name.split(".").pop()?.toLowerCase() || "";
}

function targetFor(bucket, objectPath) {
  const lower = `${bucket}/${objectPath}`.toLowerCase();
  if (lower.includes("avatar") || bucket === "profile-avatars") {
    return { maxDimension: 720, maxBytes: 280_000, quality: 82 };
  }
  if (lower.includes("small") || lower.includes("thumbnail") || lower.includes("partner")) {
    return { maxDimension: 900, maxBytes: 360_000, quality: 80 };
  }
  return { maxDimension: 1440, maxBytes: 720_000, quality: 82 };
}

function optimizedPath(objectPath) {
  const extension = path.posix.extname(objectPath);
  const base = extension ? objectPath.slice(0, -extension.length) : objectPath;
  return `${base}.optimized.webp`;
}

async function listDirectory(bucket, prefix = "") {
  const entries = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw new Error(`${bucket}/${prefix}: ${error.message}`);
    if (!data?.length) break;

    for (const entry of data) {
      const objectPath = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.id || entry.metadata) entries.push({ bucket, path: objectPath, ...entry });
      else entries.push(...await listDirectory(bucket, objectPath));
    }
    if (data.length < limit) break;
    offset += limit;
  }

  return entries;
}

async function encodeWithinLimit(input, preset) {
  const source = sharp(input, { animated: false, failOn: "none" }).rotate();
  const metadata = await source.metadata();
  const originalMax = Math.max(metadata.width || 0, metadata.height || 0);
  let dimension = Math.min(preset.maxDimension, originalMax || preset.maxDimension);
  let quality = preset.quality;
  let output;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    output = await source
      .clone()
      .resize({
        width: dimension,
        height: dimension,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality, effort: 5, smartSubsample: true })
      .toBuffer();
    if (output.length <= preset.maxBytes) break;
    if (quality > 66) quality -= 6;
    else dimension = Math.max(480, Math.round(dimension * 0.84));
  }

  return {
    output,
    width: metadata.width || null,
    height: metadata.height || null,
    targetDimension: dimension,
    quality,
  };
}

function publicUrl(bucket, objectPath) {
  return supabase.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl;
}

function possibleUrls(bucket, objectPath) {
  const encodedPath = objectPath.split("/").map(encodeURIComponent).join("/");
  return new Set([
    publicUrl(bucket, objectPath),
    `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`,
    `${supabaseUrl}/storage/v1/object/public/${bucket}/${encodedPath}`,
  ]);
}

async function migrateObject(object) {
  const ext = extensionOf(object.path);
  if (!IMAGE_EXTENSIONS.has(ext) || object.path.endsWith(".optimized.webp")) return null;

  const { data, error } = await supabase.storage.from(object.bucket).download(object.path);
  if (error) throw new Error(`${object.bucket}/${object.path}: ${error.message}`);
  const input = Buffer.from(await data.arrayBuffer());
  const preset = targetFor(object.bucket, object.path);

  if (ext === "webp" && input.length <= preset.maxBytes) {
    return {
      bucket: object.bucket,
      sourcePath: object.path,
      targetPath: object.path,
      sourceBytes: input.length,
      targetBytes: input.length,
      skipped: "already-optimized",
    };
  }

  let encoded;
  try {
    encoded = await encodeWithinLimit(input, preset);
  } catch (error_) {
    return {
      bucket: object.bucket,
      sourcePath: object.path,
      sourceBytes: input.length,
      skipped: `decode-error: ${error_.message}`,
    };
  }

  if (ext === "webp" && encoded.output.length >= input.length * 0.98) {
    return {
      bucket: object.bucket,
      sourcePath: object.path,
      targetPath: object.path,
      sourceBytes: input.length,
      targetBytes: input.length,
      skipped: "no-meaningful-saving",
    };
  }

  const targetPath = optimizedPath(object.path);
  if (APPLY) {
    const { error: uploadError } = await supabase.storage
      .from(object.bucket)
      .upload(targetPath, encoded.output, {
        upsert: true,
        contentType: "image/webp",
        cacheControl: "31536000",
      });
    if (uploadError) throw new Error(`${object.bucket}/${targetPath}: ${uploadError.message}`);
  }

  return {
    bucket: object.bucket,
    sourcePath: object.path,
    targetPath,
    sourceUrl: publicUrl(object.bucket, object.path),
    targetUrl: publicUrl(object.bucket, targetPath),
    sourceBytes: input.length,
    targetBytes: encoded.output.length,
    sourceSha256: createHash("sha256").update(input).digest("hex"),
    targetSha256: createHash("sha256").update(encoded.output).digest("hex"),
    sourceWidth: encoded.width,
    sourceHeight: encoded.height,
    targetDimension: encoded.targetDimension,
    quality: encoded.quality,
  };
}

async function updateDatabaseUrl(table, field, row, migration) {
  const current = row[field];
  if (!current || migration.sourcePath === migration.targetPath) return false;
  const candidates = possibleUrls(migration.bucket, migration.sourcePath);
  if (!candidates.has(current)) return false;
  if (!APPLY) return true;

  const { error } = await supabase
    .from(table)
    .update({ [field]: migration.targetUrl })
    .eq("id", row.id);
  if (error) throw new Error(`${table}.${field}/${row.id}: ${error.message}`);
  return true;
}

async function updateDatabase(migrations) {
  const updates = [];
  for (const [table, fields] of Object.entries(TABLE_FIELDS)) {
    const selection = ["id", ...fields].join(",");
    const { data: rows, error } = await supabase.from(table).select(selection);
    if (error) {
      updates.push({ table, skipped: error.message });
      continue;
    }
    for (const row of rows || []) {
      for (const field of fields) {
        for (const migration of migrations) {
          if (!migration.targetUrl || migration.skipped) continue;
          if (await updateDatabaseUrl(table, field, row, migration)) {
            updates.push({
              table,
              id: row.id,
              field,
              from: row[field],
              to: migration.targetUrl,
            });
            break;
          }
        }
      }
    }
  }
  return updates;
}

async function updateTemporaryMedia(migrations) {
  const { data: rows, error } = await supabase
    .from("temporary_media")
    .select("id,bucket,object_path");
  if (error) return [{ table: "temporary_media", skipped: error.message }];

  const updates = [];
  for (const row of rows || []) {
    const migration = migrations.find(
      (item) => item.bucket === row.bucket && item.sourcePath === row.object_path && item.targetPath,
    );
    if (!migration || migration.sourcePath === migration.targetPath || migration.skipped) continue;
    if (APPLY) {
      const { error: updateError } = await supabase
        .from("temporary_media")
        .update({ object_path: migration.targetPath, mime_type: "image/webp", size_bytes: migration.targetBytes })
        .eq("id", row.id);
      if (updateError) throw new Error(`temporary_media/${row.id}: ${updateError.message}`);
    }
    updates.push({
      table: "temporary_media",
      id: row.id,
      field: "object_path",
      from: row.object_path,
      to: migration.targetPath,
    });
  }
  return updates;
}

async function main() {
  await mkdir(REPORT_DIR, { recursive: true });
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) throw bucketsError;

  const objects = [];
  for (const bucket of buckets || []) {
    objects.push(...await listDirectory(bucket.id));
  }

  const candidates = objects.filter((object) => IMAGE_EXTENSIONS.has(extensionOf(object.path)));
  const migrations = [];
  for (const [index, object] of candidates.entries()) {
    process.stdout.write(`\r[${index + 1}/${candidates.length}] ${object.bucket}/${object.path}                    `);
    const result = await migrateObject(object);
    if (result) migrations.push(result);
  }
  process.stdout.write("\n");

  const dbUpdates = await updateDatabase(migrations);
  dbUpdates.push(...await updateTemporaryMedia(migrations));

  if (APPLY && DELETE_ORIGINALS) {
    for (const migration of migrations) {
      if (!migration.targetUrl || migration.sourcePath === migration.targetPath || migration.skipped) continue;
      const referenced = dbUpdates.some((update) => update.from === migration.sourceUrl);
      if (!referenced) continue;
      const { error } = await supabase.storage.from(migration.bucket).remove([migration.sourcePath]);
      if (error) throw new Error(`Не удалось удалить ${migration.bucket}/${migration.sourcePath}: ${error.message}`);
      migration.originalDeleted = true;
    }
  }

  const sourceBytes = migrations.reduce((sum, item) => sum + (item.sourceBytes || 0), 0);
  const targetBytes = migrations.reduce((sum, item) => sum + (item.targetBytes || item.sourceBytes || 0), 0);
  const timestamp = new Date().toISOString().replaceAll(":", "-");
  const reportPath = path.join(REPORT_DIR, `${APPLY ? "applied" : "audit"}-${timestamp}.json`);
  const report = {
    mode: APPLY ? "apply" : "audit",
    generatedAt: new Date().toISOString(),
    deleteOriginals: DELETE_ORIGINALS,
    totals: {
      buckets: buckets?.length || 0,
      storageObjects: objects.length,
      imageCandidates: candidates.length,
      processed: migrations.filter((item) => !item.skipped).length,
      skipped: migrations.filter((item) => item.skipped).length,
      databaseUpdates: dbUpdates.filter((item) => !item.skipped).length,
      sourceBytes,
      targetBytes,
      savedBytes: Math.max(0, sourceBytes - targetBytes),
      savedPercent: sourceBytes ? Math.round((1 - targetBytes / sourceBytes) * 1000) / 10 : 0,
    },
    migrations,
    databaseUpdates: dbUpdates,
  };
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ reportPath, ...report.totals }, null, 2));
  if (!APPLY) console.log("Это dry-run. Для применения: npm run media:migrate");
}

main().catch((error) => {
  console.error(`\nMedia migration failed: ${error.message}`);
  process.exitCode = 1;
});
