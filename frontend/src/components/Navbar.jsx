import "./Navbar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLoginClick = (e) => {
    e.preventDefault();

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

  const handleCartClick = (e) => {
    e.preventDefault();

    if (token) {
      navigate("/carrito");
    }
  };

  return (
    <header className="navbarHeader d-flex justify-content-between align-items-center gap-5">
      <Link to="/" className="navbarLogo">
        <img src="/images/logo.png" alt="logo" />
      </Link>

      <nav className="navbarLinks d-none d-lg-flex gap-4">
        <Link to="/">Inicio</Link>
        <Link to="/conciertos">Conciertos</Link>
        <Link to="/musica">Música</Link>
        <Link to="/tienda">Tienda</Link>
      </nav>

      <div className="d-flex align-items-center gap-3">
        <button
          className="navBurger d-lg-none"
          onClick={() => setIsMenuOpen((v) => !v)}
          aria-label="Abrir menú"
          aria-expanded={isMenuOpen}
        >
          ☰
        </button>

        {token && (
          <button className="cartIcon d-none d-lg-inline-block" onClick={handleCartClick}>
            <img src="/images/carrito.svg" alt="Carrito" />
          </button>
        )}

        <button className="loginIcon d-none d-lg-inline-block" onClick={handleLoginClick}>
          <img src="/images/login.svg" alt="Login" />
        </button>
      </div>

      {isMenuOpen && (
        <div className="mobileMenu d-lg-none d-flex flex-column gap-3">
          <nav className="d-flex flex-column gap-2">
            <Link className="mobileLink" to="/">Inicio</Link>
            <Link className="mobileLink" to="/conciertos">Conciertos</Link>
            <Link className="mobileLink" to="/musica">Música</Link>
            <Link className="mobileLink" to="/tienda">Tienda</Link>
          </nav>

          <div className="mobileDivider" />

          <div className="d-flex flex-column gap-2">
            {token && (
              <button className="mobileBtn" onClick={handleCartClick}>
                Carrito
              </button>
            )}
            <button className="mobileBtn" onClick={handleLoginClick}>
              {token ? "Mi cuenta" : "Iniciar sesión"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;