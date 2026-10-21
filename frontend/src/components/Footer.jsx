import { Link } from "react-router-dom";
import "./Footer.css";

const social = [
  [
    "Instagram",
    "https://www.instagram.com/sonsofaral/",
    "/images/redesSociales/instagram.png",
  ],
  [
    "YouTube",
    "https://www.youtube.com/@SonsOfAral",
    "/images/redesSociales/youtube.png",
  ],
  [
    "Facebook",
    "https://www.facebook.com/sonsofaral",
    "/images/redesSociales/facebook.png",
  ],
  [
    "TikTok",
    "https://www.tiktok.com/@sonsofaral_band",
    "/images/redesSociales/tiktok.png",
  ],
  [
    "Spotify",
    "https://open.spotify.com/intl-es/artist/3rXaE7VIG232g8KyMp1Rul",
    "/images/redesSociales/spotify.png",
  ],
];

function Footer() {
  return (
    <footer className="siteFooter">
      <div className="footerInner">
        <div className="footerSocial" aria-label="Redes sociales">
          {social.map(([name, href, icon]) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={name}
            >
              <img src={icon} alt="" />
            </a>
          ))}
        </div>
        <div className="footerMeta">
          <span>© {new Date().getFullYear()} Sons of Aral</span>
          <Link to="/privacidad">Privacidad</Link>
          <Link to="/aviso-legal">Aviso legal</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
