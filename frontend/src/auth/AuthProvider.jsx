import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { apiJson, clearSession, getAuthToken, SESSION_EVENT, setSession } from "../lib/api";
export function AuthProvider({ children }) {
  const [token, setToken] = useState(getAuthToken);
  const [session, setState] = useState({ user: null, status: "checking", error: "" });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const sync = () => setToken(getAuthToken());
    window.addEventListener(SESSION_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SESSION_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  useEffect(() => {
    if (!token || (session.token === token && session.status !== "checking")) return;
    const controller = new AbortController();
    apiJson("/auth/me", { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        const user = data?.data?.user;
        setState({ token, user, status: user?.rol === "admin" ? "authenticated" : "forbidden", error: "" });
      })
      .catch((error) => {
        if (controller.signal.aborted || error.status === 401) return;
        setState({ token, user: null, status: "error", error: "No se pudo comprobar tu sesión. Puedes reintentarlo." });
      });
    return () => controller.abort();
  }, [token, retry, session.token, session.status]);
  async function login(email, password) {
    const response = await apiJson("/auth/login", {
      auth: false, method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const user = response?.data?.user;
    const newToken = response?.data?.token;
    if (!newToken || user?.rol !== "admin") throw new Error("Respuesta de acceso inválida.");
    setState({ token: newToken, user, status: "authenticated", error: "" });
    setSession(newToken);
  }
  async function logout() {
    try { await apiJson("/auth/logout", { method: "POST" }); }
    finally {
      clearSession(); setState({ user: null, status: "checking", error: "" });
    }
  }
  function recheck() {
    setState({ user: null, status: "checking", error: "" }); setRetry((value) => value + 1);
  }
  const status = !token ? "unauthenticated" : session.token !== token ? "checking" : session.status;
  return <AuthContext.Provider value={{ ...session, user: status === "authenticated" ? session.user : null, status, login, logout, recheck }}>{children}</AuthContext.Provider>;
}
