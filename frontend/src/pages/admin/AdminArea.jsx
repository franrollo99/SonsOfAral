import { Link, useNavigate } from "react-router-dom";
import "./AdminArea.css";
import { useAuth } from "../../auth/AuthContext";

function AdminArea() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const onLogout = async () => {
    try {
      await logout();
    } catch {
      /* El cierre local se completa aunque el servidor no responda. */
    }
    navigate("/gestion/acceso", { replace: true });
  };

  const sections = [
    {
      title: "Contenido de la web",
      desc: "Foto de Inicio y logo.",
      to: "contenido",
    },
    { title: "Conciertos", desc: "Gestionar conciertos.", to: "conciertos" },
    {
      title: "Lanzamientos",
      desc: "Gestionar lanzamientos.",
      to: "lanzamientos",
    },
    {
      title: "Galerías",
      desc: "Gestionar galerías de imágenes.",
      to: "galerias",
    },
  ];

  return (
    <section className="container">
      <div className="adminCard">
        <div className="d-flex align-items-center justify-content-between gap-3">
          <div>
            <h1 className="adminTitle">Panel de gestión</h1>
          </div>

          <button className="adminLinkBtn" type="button" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>

        <div className="adminDivider" />

        <div className="mb-4">
          <Link className="adminLinkBtn" to="/gestion/contrasena">
            Cambiar contraseña
          </Link>
        </div>

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
