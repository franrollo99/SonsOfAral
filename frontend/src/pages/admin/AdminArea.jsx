import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminArea.css";

const API_URL = import.meta.env.VITE_API_URL;

function AdminArea() {
  const navigate = useNavigate();
  const token = useMemo(() => localStorage.getItem("token"), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const run = async () => {
      setError("");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const meRes = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const meData = await meRes.json().catch(() => ({}));

        if (!meRes.ok) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }

        const user = meData?.data?.user ?? meData?.user ?? null;

        if (!user) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }

        if (user.rol !== "admin") {
          navigate("/", { replace: true });
          return;
        }
      } catch {
        setError("No se pudo cargar tu sesión. Reintenta.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [navigate, token]);

  const onLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
    } catch { } finally {
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
    }
  };

  const sections = [
    { title: "Conciertos", desc: "Gestionar conciertos.", to: "conciertos" },
    { title: "Lanzamientos", desc: "Gestionar lanzamientos.", to: "lanzamientos" },
    { title: "Canciones", desc: "Visualizar detalles de canciones.", to: "canciones" },
    { title: "Productos", desc: "Gestionar productos .", to: "productos" },
    { title: "Pedidos", desc: "Ver detalles de pedidos y cambiar estados.", to: "pedidos" },
    { title: "Usuarios", desc: "Listado de usuarios y visualizacion de información.", to: "usuarios" },
  ];

  if (loading) {
    return (
      <section className="container">
        <div className="adminCard">
          <h1 className="adminTitle">Área de administración</h1>
          <p className="adminMuted">Cargando...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container">
        <div className="adminCard">
          <h1 className="adminTitle">Área de administración</h1>
          <p className="adminError">{error}</p>
          <button className="adminBtn" onClick={() => navigate("/login")}>
            Volver al login
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="container">
      <div className="adminCard">
        <div className="d-flex align-items-center justify-content-between gap-3">
          <div>
            <h1 className="adminTitle">Panel de gestión</h1>
            <p className="adminMuted">
              Sesión: {user?.nombre ? `${user.nombre} ${user.apellidos || ""}` : "Admin"}
            </p>
          </div>

          <button className="adminLinkBtn" type="button" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>

        <div className="adminDivider" />

        <div className="adminGrid">
          {sections.map((s) => (
            <Link key={s.to} to={s.to} className="adminTile">
              <div className="adminTileTitle">{s.title}</div>
              <div className="adminTileDesc">{s.desc}</div>
              <div className="adminTileGo">Entrar →</div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}

export default AdminArea;
