import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
function AdminRoute() {
  const { status, error, recheck } = useAuth();
  if (status === "checking") return <p className="container py-4">Comprobando acceso…</p>;
  if (status === "unauthenticated") return <Navigate to="/gestion/acceso" replace />;
  if (status === "forbidden") return <Navigate to="/" replace />;
  if (status === "error") return <section><p role="alert">{error}</p><button className="adminBtn" onClick={recheck}>Reintentar</button></section>;
  return <Outlet />;
}
export default AdminRoute;
