import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RouteMetadata from "../components/RouteMetadata";
import "./AppLayout.css";

function AppLayout() {
  return (
    <div className="appLayout">
      <RouteMetadata />
      <a href="#main-content" className="skipLink">
        Saltar al contenido
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default AppLayout;
