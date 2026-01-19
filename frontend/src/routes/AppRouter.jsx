import { Routes, Route } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import Home from "../pages/home/Home";
import Login from "../pages/auth/Login";
import ResetPassword from "../pages/auth/ResetPassword";
import Register from "../pages/auth/Register";
import ClientArea from "../pages/clientArea/ClientArea";
import Concerts from "../pages/concerts/Concerts";
import Music from "../pages/music/Music";
import Shop from "../pages/shop/Shop";
import ProductDetails from "../pages/shop/ProductDetails";
import AdminArea from "../pages/admin/AdminArea";
import ConcertsManagement from "../pages/admin/adminManagement/ConcertsManagement";
import ReleasesManagement from "../pages/admin/adminManagement/ReleasesManagement";
import SongsManagement from "../pages/admin/adminManagement/SongsManagement";
import ProductsManagement from "../pages/admin/adminManagement/ProductsManagement";
import ProductTypesManagement from "../pages/admin/adminManagement/ProductTypesManagement";
import UsersManagement from "../pages/admin/adminManagement/UsersManagement";
import OrdersManagement from "../pages/admin/adminManagement/OrdersManagement";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recovery-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/conciertos" element={<Concerts />} />
        <Route path="/musica" element={<Music />} />
        <Route path="/tienda" element={<Shop />} />
        <Route path="/tienda/:slug" element={<ProductDetails />} />
        <Route path="/area-cliente" element={<ClientArea />} />
        <Route path="/area-admin" element={<AdminArea />} />
        <Route path="/area-admin/conciertos" element={<ConcertsManagement />} />
        <Route path="/area-admin/lanzamientos" element={<ReleasesManagement />} />
        <Route path="/area-admin/canciones" element={<SongsManagement />} />
        <Route path="/area-admin/productos" element={<ProductsManagement />} />
        <Route path="/area-admin/tipos-producto" element={<ProductTypesManagement />} />
        <Route path="/area-admin/usuarios" element={<UsersManagement />} />
        <Route path="/area-admin/pedidos" element={<OrdersManagement />} />
      </Route>
    </Routes>
  );
}
