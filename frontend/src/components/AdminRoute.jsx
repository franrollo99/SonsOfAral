import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { apiJson, clearSession, getAuthToken } from "../lib/api";

function AdminRoute() {
  const [state, setState] = useState(() => (getAuthToken() ? "checking" : "unauthenticated"));

  useEffect(() => {
    if (!getAuthToken()) {
      return;
    }

    let mounted = true;

    apiJson("/auth/me")
      .then((data) => {
        if (!mounted) return;
        setState(data?.data?.user?.rol === "admin" ? "allowed" : "forbidden");
      })
      .catch(() => {
        clearSession();
        if (mounted) setState("unauthenticated");
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (state === "checking") return <p className="container py-4">Comprobando acceso…</p>;
  if (state === "unauthenticated") return <Navigate to="/gestion/acceso" replace />;
  if (state === "forbidden") return <Navigate to="/" replace />;

  return <Outlet />;
}

export default AdminRoute;
