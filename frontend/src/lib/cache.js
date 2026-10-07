export const CONTENT_EVENT = "soa:content";
const PREFIX = "soa:cache:v1:";
export const REVISION_KEY = "soa:content:revision";
const TTL = 5 * 60 * 1000;
export function contentRevision() {
  try { return localStorage.getItem(REVISION_KEY) || ""; } catch { return ""; }
}
export function readCache(path) {
  try {
    const entry = JSON.parse(localStorage.getItem(PREFIX + path));
    if (!entry || entry.revision !== contentRevision() || Date.now() - entry.timestamp >= TTL) return null;
    return entry.data;
  } catch { return null; }
}
export function writeCache(path, data, revision) {
  if (revision !== contentRevision()) return false;
  try { localStorage.setItem(PREFIX + path, JSON.stringify({ data, timestamp: Date.now(), revision })); }
  catch { /* El almacenamiento puede no estar disponible. */ }
  return true;
}
export function invalidateContent() {
  try {
    localStorage.setItem(REVISION_KEY, crypto.randomUUID());
    Object.keys(localStorage).filter((key) => key.startsWith(PREFIX) || ["conciertos", "lanzamientos", "galerias", "productos", "tipos-productos"].includes(key)).forEach((key) => localStorage.removeItem(key));
  } catch { /* Se notifica igualmente a las pantallas abiertas. */ }
  window.dispatchEvent(new Event(CONTENT_EVENT));
}
