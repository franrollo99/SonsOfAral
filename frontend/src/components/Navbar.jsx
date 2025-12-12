// src/components/Navbar.jsx
import "./Navbar.css";

export function Navbar() {
  return (
    <header>
      <div className="navbarLogo">
        {/* <span>Sons of Aral</span> */}
        <img src="images/logo.png" alt="logo" />

      </div>

      <nav className="navbarLinks">
        <a href="/">Inicio</a>
        <a href="/conciertos">Conciertos</a>
        <a href="/musica">Música</a>
        <a href="/galeria">Galería</a>
        <a href="/tienda">Tienda</a>
      </nav>
      <a href="/login" className="loginIcon">
        <img src="images/login.png" alt="" />
      </a>
    </header>
  );
}
