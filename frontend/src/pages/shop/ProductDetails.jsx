import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import "./ProductDetails.css";

const API_URL = import.meta.env.VITE_API_URL;

function ProductoDetalle() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { state } = useLocation();

  const [producto, setProducto] = useState(state?.producto ?? null);
  const [loading, setLoading] = useState(!state?.producto);

  const [talla, setTalla] = useState(null);
  const [qty, setQty] = useState(1);

  const tallas = useMemo(() => {
    const v = producto?.tallas_disponibles;
    if (!v) return [];
    if (Array.isArray(v)) return v;

    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [producto]);

  useEffect(() => {
  if (state?.producto) return;

  const load = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("order", "newest");

      const res = await fetch(`${API_URL}/productos?${params.toString()}`, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const lista = Array.isArray(json) ? json : json?.data ?? [];

      const found = lista.find((p) => p.slug === slug) ?? null;
      setProducto(found);
    } catch (e) {
      console.error("Error cargando producto:", e);
      setProducto(null);
    } finally {
      setLoading(false);
    }
  };

  load();
}, [slug, state?.producto]);

  useEffect(() => {
    setQty(1);
    setTalla(null);
  }, [slug]);

  useEffect(() => {
    if (!producto) return;
    if (talla) return;
    if (Array.isArray(producto.tallas_disponibles) && producto.tallas_disponibles.length > 0) {
      setTalla(producto.tallas_disponibles[0]);
    }
  }, [producto, talla]);

  const precioTxt =
    typeof producto?.precio_formateado === "string"
      ? producto.precio_formateado
      : producto?.precio != null
        ? `${Number(producto.precio).toFixed(2)} €`
        : "";

  const CART_ITEMS = "cartItems";

  const handleAddToCart = () => {
    if (!producto?.id) return;

    let cart = [];
    try {
      const raw = localStorage.getItem(CART_ITEMS);
      cart = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(cart)) cart = [];
    } catch {
      cart = [];
    }

    const addQty = Number(qty || 1);
    const index = cart.findIndex(
      (it) => it.id === producto.id && (it.talla ?? null) === (talla ?? null)
    );

    if (index !== -1) {
      cart[index].qty = (Number(cart[index].qty) || 0) + addQty;
    } else {
      cart.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: Number(producto.precio || 0),
        precio_formateado: producto.precio_formateado,
        imagen: producto.imagen,
        qty: addQty,
        talla: talla ?? null,
      });
    }

    localStorage.setItem(CART_ITEMS, JSON.stringify(cart));
    navigate("/carrito");
  };

  return (
    <section>
      <div className="container productoDetalleContainer">
        {loading ? (
          <div className="productoDetalleLoading">Cargando producto...</div>
        ) : !producto ? (
          <div className="productoDetalleEmpty">Producto no encontrado.</div>
        ) : (
          <div className="d-flex productoDetalleLayout gap-5">
            <div className="productoDetalleLeft">
              <div className="productoDetalleImgBox">
                <img
                  className="productoDetalleImg"
                  src={producto.imagen ?? "/images/productos/camiseta01.png"}
                  alt={producto.nombre}
                />
              </div>
            </div>

            <div className="productoDetalleRight flex-grow-1">
              <div className="d-flex align-items-start justify-content-between gap-3">
                <h1 className="productoDetalleTitle">{producto.nombre}</h1>
              </div>

              <div className="productoDetallePrice">{precioTxt}</div>

              {producto.descripcion && (
                <p className="productoDetalleDesc">{producto.descripcion}</p>
              )}

              {tallas.length > 0 && (
                <div className="productoDetalleBlock">
                  <div className="productoDetalleLabel">Talla</div>

                  <div className="d-flex flex-wrap gap-2">
                    {tallas.map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`productoTallaBtn ${talla === t ? "isActive" : ""}`}
                        onClick={() => setTalla(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="productoDetalleBlock">
                <div className="productoDetalleLabel">Cantidad</div>

                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="productoQtyBtn"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    −
                  </button>

                  <input
                    type="number"
                    className="productoQtyInput"
                    min={1}
                    max={99}
                    value={qty}
                    onChange={(e) => {
                      const v = e.target.value;

                      if (v === "") {
                        setQty("");
                        return;
                      }

                      const n = Number(v);
                      if (Number.isNaN(n)) return;

                      setQty(Math.min(99, Math.max(1, n)));
                    }}
                    onBlur={() => {
                      if (!qty || qty < 1) setQty(1);
                    }}
                    aria-label="Cantidad"
                  />

                  <button
                    type="button"
                    className="productoQtyBtn"
                    onClick={() => setQty((q) => Math.min(99, q + 1))}
                  >
                    +
                  </button>
                </div>
              </div>

              <button className="productoAddBtn" onClick={handleAddToCart}>
                Añadir al carrito
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductoDetalle;