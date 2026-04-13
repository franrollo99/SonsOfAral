import { Routes, Route } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import Home from "../pages/home/Home";
import Login from "../pages/auth/Login";
import ResetPassword from "../pages/auth/ResetPassword";
import Register from "../pages/auth/Register";
import ClientArea from "../pages/clientArea/ClientArea";
import Concerts from "../pages/concerts/Concerts";
import Music from "../pages/music/Music";
import Gallery from "../pages/gallery/Gallery";
import GalleryDetail from "../pages/gallery/GalleryDetail";
import Shop from "../pages/shop/Shop";
import ProductDetails from "../pages/shop/ProductDetails";
import Cart from "../pages/cart/Cart";
import Checkout from "../pages/checkout/Checkout";
import CheckoutSuccess from "../pages/checkout/CheckoutSuccess";
import AdminArea from "../pages/admin/AdminArea";
import ConcertsManagement from "../pages/admin/adminManagement/ConcertsManagement";
import ReleasesManagement from "../pages/admin/adminManagement/ReleasesManagement";
import SongsManagement from "../pages/admin/adminManagement/SongsManagement";
import GalleryManagement from "../pages/admin/adminManagement/GalleryManagement";
import ProductsManagement from "../pages/admin/adminManagement/ProductsManagement";
import UsersManagement from "../pages/admin/adminManagement/UsersManagement";
import OrdersManagement from "../pages/admin/adminManagement/OrdersManagement";
import ProtectedRoute from "../components/ProtectedRoute";
import RegisterSuccess from "../pages/auth/RegisterSuccess";
import Privacidad from "../pages/legal/Privacidad";
import AvisoLegal from "../pages/legal/AvisoLegal";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-success" element={<RegisterSuccess />} />
        <Route path="/conciertos" element={<Concerts />} />
        <Route path="/musica" element={<Music />} />
        <Route path="/galeria" element={<Gallery />} />
        <Route path="/galeria/:id" element={<GalleryDetail />} />
        <Route path="/tienda" element={<Shop />} />
        <Route path="/tienda/:slug" element={<ProductDetails />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/carrito" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
        </Route>
        <Route path="/checkout/success/:pedidoId" element={<CheckoutSuccess />} />
        <Route path="/area-cliente" element={<ClientArea />} />
        <Route path="/area-admin" element={<AdminArea />} />
        <Route path="/area-admin/conciertos" element={<ConcertsManagement />} />
        <Route path="/area-admin/lanzamientos" element={<ReleasesManagement />} />
        <Route path="/area-admin/canciones" element={<SongsManagement />} />
        <Route path="/area-admin/galerias" element={<GalleryManagement />} />
        <Route path="/area-admin/productos" element={<ProductsManagement />} />
        <Route path="/area-admin/usuarios" element={<UsersManagement />} />
        <Route path="/area-admin/pedidos" element={<OrdersManagement />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/aviso-legal" element={<AvisoLegal />} />
      </Route>
    </Routes>
  );
}
