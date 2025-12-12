// src/components/Footer.jsx
import "./Footer.css";

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <nav>
          <ul>
            <li>
              <a href="/privacidad">Privacidad</a>
            </li>
            <li>
              <a href="/aviso-legal">Aviso Legal</a>
            </li>
            <li>
              <a href="/politica-de-cookies">Política de Cookies</a>
            </li>
          </ul>
        </nav>
      </div>
      <p className="footer__small">© {new Date().getFullYear()} Sons of Aral. Todos los derechos reservados.</p>
    </footer>
  );
}
