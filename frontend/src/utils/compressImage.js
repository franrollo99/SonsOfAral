import imageCompression from "browser-image-compression";

export async function compressImageIfNeeded(file, { logo = false } = {}) {
  if (!(file instanceof File)) return file;
  if (!String(file.type || "").startsWith("image/")) return file;

  if (logo) return file;

  return imageCompression(file, {
    maxSizeMB: 4,
    maxWidthOrHeight: 2400,
    useWebWorker: true,
  });
}
