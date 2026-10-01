import "./Navbar.css";
import { Link } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="navbarHeader d-flex justify-content-between align-items-center gap-5">
      <Link to="/" className="navbarLogo">
        <img src="/images/logo.png" alt="logo" />
      </Link>

      <nav className="navbarLinks d-none d-lg-flex gap-4">
        <Link to="/">Inicio</Link>
        <Link to="/conciertos">Conciertos</Link>
        <Link to="/musica">Música</Link>
        <Link to="/galeria">Galería</Link>
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

      </div>

      {isMenuOpen && (
        <div className="mobileMenu d-lg-none d-flex flex-column gap-3">
          <nav className="d-flex flex-column gap-2">
            <Link className="mobileLink" to="/" onClick={() => setIsMenuOpen(false)}>Inicio</Link>
            <Link className="mobileLink" to="/conciertos" onClick={() => setIsMenuOpen(false)}>Conciertos</Link>
            <Link className="mobileLink" to="/musica" onClick={() => setIsMenuOpen(false)}>Música</Link>
            <Link className="mobileLink" to="/galeria" onClick={() => setIsMenuOpen(false)}>Galería</Link>
          </nav>

        </div>
      )}
    </header>
  );
}

export default Navbar;
