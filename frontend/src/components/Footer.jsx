import "./Footer.css";

function Footer() {
  return (
    <footer className="p-4 d-flex flex-column gap-3 text-center">
      <div className="d-flex justify-content-center align-items-center gap-5">
        <ul className="nav d-flex align-items-center gap-4">
          <li className="nav-item">
            <a href="/privacidad" className="nav-link active">Privacidad</a>
          </li>
          <li className="nav-item">
            <a href="/aviso-legal" className="nav-link active">Aviso Legal</a>
          </li>
          <li className="nav-item">
            <a href="/politica-de-cookies" className="nav-link active">Política de Cookies</a>
          </li>
        </ul>
        <div className="redesSociales d-flex align-items-center gap-4">
          <a href="#"><img src="images/redesSociales/instagram.png" alt="Icono instagram" /></a>
          <a href="#"><img src="images/redesSociales/youtube.png" alt="Icono youtube" /></a>
          <a href="#"><img src="images/redesSociales/facebook.png" alt="Icono facebook" /></a>
          <a href="#"><img src="images/redesSociales/tiktok.png" alt="Icono tik tok" /></a>
          <a href="#"><img src="images/redesSociales/spotify.png" alt="Icono spotify" /></a>
        </div>
      </div>
      <p className="copyrigth">© {new Date().getFullYear()} Sons of Aral. Todos los derechos reservados.</p>
    </footer>
  );
}

export default Footer;