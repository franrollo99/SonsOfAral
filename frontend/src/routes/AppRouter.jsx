// src/routes/AppRouter.jsx
import { Routes, Route } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import Home from "../pages/Home";
import Login from "../pages/InicioSesion/Login";
import Register from "../pages/InicioSesion/Register";
import Conciertos from "../pages/Conciertos/Conciertos";
import Musica from "../pages/Musica/Musica";
// Importa aquí las demás páginas cuando las vayas creando
// import { ConcertsPage } from "../pages/ConcertsPage";
// import { ShopPage } from "../pages/ShopPage";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index path="/" element={<Home />} />
        <Route path="/conciertos" element={<Conciertos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/musica" element={<Musica />} />
        {/* Ejemplos para futuro */}
        {/* <Route path="/conciertos" element={<ConcertsPage />} /> */}
        {/* <Route path="/tienda" element={<ShopPage />} /> */}
      </Route>
    </Routes>
  );
}
