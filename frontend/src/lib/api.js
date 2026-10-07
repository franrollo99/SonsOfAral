import { invalidateContent } from "./cache.js";
const BASE = (import.meta.env?.VITE_API_URL || "").replace(/\/$/, "");
export const SESSION_EVENT = "soa:session";
export function getAuthToken() {
  return localStorage.getItem("token");
}
export function setSession(token) {
  localStorage.setItem("token", token);
  localStorage.removeItem("rol");
  window.dispatchEvent(new Event(SESSION_EVENT));
}
export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("rol");
  window.dispatchEvent(new Event(SESSION_EVENT));
}
export function apiUrl(path) {
  return BASE + path;
}
export async function apiRequest(path, options = {}) {
  const { auth = true, ...request } = options;
  const token = auth ? getAuthToken() : null;
  const headers = new Headers(request.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let response;
  try {
    response = await fetch(apiUrl(path), { ...request, headers });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
      { cause: error },
    );
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    if (response.status === 401 && token && token === getAuthToken())
      clearSession();
    const fields = data.errors
      ? Object.values(data.errors).flat().join(" ")
      : "";
    const error = new Error(
      fields || data.message || `Error de comunicación (${response.status}).`,
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return response;
}
export async function apiJson(path, options = {}) {
  const response = await apiRequest(path, options);
  if (
    options.method &&
    !["GET", "HEAD"].includes(options.method.toUpperCase()) &&
    /^\/(conciertos|lanzamientos|galerias|contenido-web)(\/|$)/.test(path)
  )
    invalidateContent();
  if (response.status === 204) return null;
  try {
    return await response.json();
  } catch {
    throw new Error("El servidor devolvió una respuesta inválida.");
  }
}
