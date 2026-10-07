import { useEffect, useState } from "react";
import { apiJson } from "../lib/api";
import { CONTENT_EVENT, REVISION_KEY, contentRevision, readCache, writeCache } from "../lib/cache";
export function useContent(path) {
  const [state, setState] = useState(() => {
    const data = readCache(path);
    return { path, data, loading: data === null, error: null };
  });
  useEffect(() => {
    let controller;
    let active = true;
    async function load(force = false) {
      controller?.abort();
      controller = new AbortController();
      const signal = controller.signal;
      const cached = force ? null : readCache(path);
      setState({ path, data: cached, loading: cached === null, error: null });
      if (cached !== null) return;
      const revision = contentRevision();
      try {
        const response = await apiJson(path, { auth: false, signal });
        if (!active || signal.aborted || revision !== contentRevision()) return;
        const data = response?.data ?? response;
        writeCache(path, data, revision);
        setState({ path, data, loading: false, error: null });
      } catch (error) {
        if (!active || signal.aborted) return;
        setState({ path, data: cached, loading: false, error: error.message || "No se pudo cargar el contenido." });
      }
    }
    const reload = () => { void load(true); };
    const storage = (event) => { if (event.key === REVISION_KEY || event.key === null) reload(); };
    const focus = () => { if (readCache(path) === null) reload(); };
    void load();
    window.addEventListener(CONTENT_EVENT, reload);
    window.addEventListener("storage", storage);
    window.addEventListener("focus", focus);
    return () => {
      active = false; controller?.abort();
      window.removeEventListener(CONTENT_EVENT, reload);
      window.removeEventListener("storage", storage);
      window.removeEventListener("focus", focus);
    };
  }, [path]);
  return state.path === path ? state : { data: null, loading: true, error: null };
}
