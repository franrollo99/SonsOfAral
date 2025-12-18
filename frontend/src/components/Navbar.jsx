import "./Navbar.css";

function Navbar() {
  return (
    <header className="d-flex justify-content-between align-items-center gap-5">
      <div className="navbarLogo">
        <img src="images/logo.png" alt="logo" />

      </div>

      <nav className="navbarLinks d-flex gap-4">
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

export default Navbar;