import { Routes, Route } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import Home from "../pages/home/Home";
import Login from "../pages/auth/Login";
import ResetPassword from "../pages/auth/ResetPassword";
import Register from "../pages/auth/Register";
import Concerts from "../pages/concerts/Concerts";
import Music from "../pages/music/Music";
import Shop from "../pages/shop/Shop";
import ProductDetails from "../pages/shop/ProductDetails";

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
      </Route>
    </Routes>
  );
}
