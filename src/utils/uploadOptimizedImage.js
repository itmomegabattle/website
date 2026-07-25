import { optimizeImageFile } from "./imageOptimization";

export async function uploadOptimizedImage(file, {
  preset = "content",
  purpose = "content",
  requestUpload,
  uploadFile,
}) {
  const optimizedFile = await optimizeImageFile(file, preset);
  const signed = await requestUpload({
    mimeType: optimizedFile.type,
    sizeBytes: optimizedFile.size,
    purpose,
  });
  await uploadFile(signed, optimizedFile);
  return signed.publicUrl;
}

