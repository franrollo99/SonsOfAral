import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLoginClick = (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("rol");

    if (!token) {
      navigate("/login");
      return;
    }

    if (rol === "admin") {
      navigate("/area-admin");
    } else {
      navigate("/area-cliente");
    }
  };

  return (
    <header className="d-flex justify-content-between align-items-center gap-5">
      <Link to="/">
        <div className="navbarLogo">
          <img src="/images/logo.png" alt="logo" />
        </div>
      </Link>

      <nav className="navbarLinks d-flex gap-4">
        <Link to="/">Inicio</Link>
        <Link to="/conciertos">Conciertos</Link>
        <Link to="/musica">Música</Link>
        <Link to="/tienda">Tienda</Link>
      </nav>

      <button className="loginIcon" onClick={handleLoginClick}>
        <img src="/images/login.png" alt="Login" />
      </button>
    </header>
  );
}

export default Navbar;
