const PRESETS = {
  avatar: { maxDimension: 640, maxBytes: 180_000, quality: 0.82 },
  thumbnail: { maxDimension: 800, maxBytes: 260_000, quality: 0.8 },
  content: { maxDimension: 1280, maxBytes: 520_000, quality: 0.82 },
};

const PASSTHROUGH_TYPES = new Set(["image/svg+xml", "image/gif"]);

function extensionFor(type) {
  if (type === "image/webp") return "webp";
  if (type === "image/png") return "png";
  return "jpg";
}

function renameFile(name, type) {
  const base = String(name || "image").replace(/\.[^.]+$/, "").replace(/[^\p{L}\p{N}._-]+/gu, "-");
  return `${base || "image"}.${extensionFor(type)}`;
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Не удалось сжать изображение"))),
      type,
      quality,
    );
  });
}

async function decodeImage(file) {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      try {
        return await createImageBitmap(file);
      } catch {
        // Старые версии Safari объявляют createImageBitmap, но не умеют
        // декодировать часть HEIC/JPEG. Ниже остаётся совместимый Image fallback.
      }
    }
  }

  const url = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = "async";
  image.src = url;
  try {
    await image.decode();
    image.dataset.objectUrl = url;
    return image;
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

function closeDecodedImage(image) {
  if (typeof image?.close === "function") image.close();
  if (image?.dataset?.objectUrl) URL.revokeObjectURL(image.dataset.objectUrl);
}

export async function optimizeImageFile(file, presetName = "content", { preservePng = false } = {}) {
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    throw new Error("Выберите файл изображения");
  }

  if (PASSTHROUGH_TYPES.has(file.type)) {
    if (file.size > 1_000_000) {
      throw new Error("SVG/GIF должен весить не больше 1 МБ");
    }
    return file;
  }

  const preset = PRESETS[presetName] || PRESETS.content;
  const image = await decodeImage(file);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;

  if (!sourceWidth || !sourceHeight) {
    closeDecodedImage(image);
    throw new Error("Не удалось прочитать размеры изображения");
  }

  let scale = Math.min(1, preset.maxDimension / Math.max(sourceWidth, sourceHeight));
  let quality = preset.quality;
  let blob = null;
  let outputType = preservePng && file.type === "image/png" ? "image/png" : "image/webp";

  try {
    for (let attempt = 0; attempt < 7; attempt += 1) {
      const width = Math.max(1, Math.round(sourceWidth * scale));
      const height = Math.max(1, Math.round(sourceHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { alpha: true });
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(image, 0, 0, width, height);

      try {
        blob = await canvasToBlob(canvas, outputType, quality);
      } catch {
        outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
        blob = await canvasToBlob(canvas, outputType, quality);
      }

      canvas.width = 1;
      canvas.height = 1;
      if (blob.size <= preset.maxBytes || (width <= 640 && height <= 640)) break;

      quality = Math.max(0.68, quality - 0.045);
      scale *= 0.88;
    }
  } finally {
    closeDecodedImage(image);
  }

  if (!blob) throw new Error("Не удалось подготовить изображение");

  return new File([blob], renameFile(file.name, outputType), {
    type: outputType,
    lastModified: Date.now(),
  });
}
