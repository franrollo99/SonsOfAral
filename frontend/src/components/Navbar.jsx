import { Link, NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./Navbar.css";
import { useContent } from "../hooks/useContent";
import { imageSrcSet } from "../lib/images";
import defaultImages from "../assets/site-images.json";

const links = [
  ["/", "Inicio"],
  ["/conciertos", "Directo"],
  ["/musica", "Música"],
  ["/galeria", "Archivo visual"],
];

function Navbar() {
  const { data: content } = useContent("/contenido-web");
  const logo = content?.logo || defaultImages.logo;
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const toggleRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 761px)");
    const resize = () => {
      if (desktop.matches) setOpen(false);
    };
    window.addEventListener("keydown", dismiss);
    desktop.addEventListener("change", resize);
    return () => {
      window.removeEventListener("keydown", dismiss);
      desktop.removeEventListener("change", resize);
    };
  }, [open]);

  return (
    <header className="siteHeader">
      <div className="siteNav">
        <Link
          to="/"
          className="brandMark"
          aria-label="Sons of Aral · Inicio"
          onClick={close}
        >
          <img
            src={logo.urlSm || logo.url}
            srcSet={imageSrcSet(logo)}
            sizes="42px"
            alt=""
          />
          <span>
            Sons
            <br />
            of Aral
          </span>
        </Link>

        <nav className="desktopNav" aria-label="Navegación principal">
          {links.map(([to, label], index) => (
            <NavLink key={to} to={to} end={to === "/"} className="navLink">
              <span>0{index + 1}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          ref={toggleRef}
          className="menuToggle"
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          <span>{open ? "Cerrar" : "Menú"}</span>
          <i aria-hidden="true" />
        </button>
      </div>

      <nav
        aria-label="Navegación móvil"
        inert={!open}
        id="mobile-navigation"
        className={`mobileNav ${open ? "isOpen" : ""}`}
        aria-hidden={!open}
      >
        {links.map(([to, label], index) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className="mobileNavLink"
            onClick={close}
          >
            <span>0{index + 1}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export default Navbar;
