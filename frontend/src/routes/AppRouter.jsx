import { Routes, Route } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import Home from "../pages/home/Home";
import Login from "../pages/auth/Login";
import ResetPassword from "../pages/auth/ResetPassword";
import Concerts from "../pages/concerts/Concerts";
import Music from "../pages/music/Music";
import Gallery from "../pages/gallery/Gallery";
import GalleryDetail from "../pages/gallery/GalleryDetail";
import AdminArea from "../pages/admin/AdminArea";
import ConcertsManagement from "../pages/admin/adminManagement/ConcertsManagement";
import ReleasesManagement from "../pages/admin/adminManagement/ReleasesManagement";
import SongsManagement from "../pages/admin/adminManagement/SongsManagement";
import GalleryManagement from "../pages/admin/adminManagement/GalleryManagement";
import UsersManagement from "../pages/admin/adminManagement/UsersManagement";
import AdminRoute from "../components/AdminRoute";
import Privacidad from "../pages/legal/Privacidad";
import AvisoLegal from "../pages/legal/AvisoLegal";
import NotFound from "../pages/NotFound";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index path="/" element={<Home />} />
        <Route path="/gestion/acceso" element={<Login />} />
        <Route path="/gestion/recuperar" element={<ResetPassword />} />
        <Route path="/conciertos" element={<Concerts />} />
        <Route path="/musica" element={<Music />} />
        <Route path="/galeria" element={<Gallery />} />
        <Route path="/galeria/:id" element={<GalleryDetail />} />
        <Route element={<AdminRoute />}>
          <Route path="/gestion" element={<AdminArea />} />
          <Route path="/gestion/conciertos" element={<ConcertsManagement />} />
          <Route path="/gestion/lanzamientos" element={<ReleasesManagement />} />
          <Route path="/gestion/canciones" element={<SongsManagement />} />
          <Route path="/gestion/galerias" element={<GalleryManagement />} />
          <Route path="/gestion/usuarios" element={<UsersManagement />} />
        </Route>
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/aviso-legal" element={<AvisoLegal />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
