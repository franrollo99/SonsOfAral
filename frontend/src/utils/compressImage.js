import imageCompression from "browser-image-compression";

export async function compressImageIfNeeded(file) {
  if (!(file instanceof File)) return file;
  if (!String(file.type || "").startsWith("image/")) return file;

  return imageCompression(file, {
    maxSizeMB: 2,
    maxWidthOrHeight: 1400,
    useWebWorker: true,
  });
}