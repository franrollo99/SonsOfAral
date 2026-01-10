import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import "./ProductDetails.css";

const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

function isNew(createdAt) {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  const now = new Date();
  const diffDays = (now - created) / (1000 * 60 * 60 * 24);
  return diffDays <= 30;
}

function ProductoDetalle() {
  const { slug } = useParams();
  const { state } = useLocation();

  // Si vienes desde la tienda y pasas state={{ producto: p }}, esto pinta instantáneo
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

  // Si ya tenemos producto por state, no hacemos fetch
  useEffect(() => {
    if (state?.producto) {
      // Selecciona talla por defecto si hay (y no hay talla ya seleccionada)
      if (!talla && Array.isArray(state.producto?.tallas_disponibles) && state.producto.tallas_disponibles.length > 0) {
        setTalla(state.producto.tallas_disponibles[0]);
      }
      return;
    }

    // URL directa / refresh: no hay state, toca fetch
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);

        // No quieres endpoint por slug, así que pedimos lista y buscamos por slug
        // (Para pocos productos en un PFG, esto va bien. Si crece, se cambia por un endpoint de lookup.)
        const params = new URLSearchParams();
        params.set("order", "newest");

        const res = await fetch(`${baseUrl}/productos?${params.toString()}`, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        const lista = Array.isArray(json) ? json : (json?.data ?? []);

        const found = lista.find((p) => p.slug === slug) ?? null;
        setProducto(found);

        // Selecciona una talla por defecto si hay
        const t = found?.tallas_disponibles;
        if (Array.isArray(t) && t.length > 0) setTalla(t[0]);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("Error cargando producto:", e);
          setProducto(null);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Si cambias de producto (otra ruta), resetea qty y talla
  useEffect(() => {
    setQty(1);
    setTalla(null);
  }, [slug]);

  // Si producto existe y trae tallas pero talla no está aún seleccionada, selecciona primera
  useEffect(() => {
    if (!producto) return;
    if (talla) return;
    if (Array.isArray(producto.tallas_disponibles) && producto.tallas_disponibles.length > 0) {
      setTalla(producto.tallas_disponibles[0]);
    }
  }, [producto, talla]);

  const nuevo = isNew(producto?.created_at);

  const precioTxt =
    typeof producto?.precio_formateado === "string"
      ? producto.precio_formateado
      : producto?.precio != null
        ? `${Number(producto.precio).toFixed(2)} €`
        : "";

  const canAdd = tallas.length === 0 || (tallas.length > 0 && talla);

  const addToCart = () => {
    console.log("ADD TO CART", {
      producto_id: producto?.id,
      slug: producto?.slug,
      talla,
      qty,
    });
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
                <img className="productoDetalleImg" src={producto.imagen ?? "/images/productos/camiseta01.png"} alt={producto.nombre} />
              </div>
            </div>

            <div className="productoDetalleRight flex-grow-1">
              <div className="d-flex align-items-start justify-content-between gap-3">
                <h1 className="productoDetalleTitle">{producto.nombre}</h1>
                {nuevo && <span className="productoBadgeNew">NEW</span>}
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
                      <button key={t} type="button" className={`productoTallaBtn ${talla === t ? "isActive" : ""}`} onClick={() => setTalla(t)}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="productoDetalleBlock">
                <div className="productoDetalleLabel">Cantidad</div>

                <div className="d-flex align-items-center gap-2">
                  <button type="button" className="productoQtyBtn" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                  
                  <input type="number" className="productoQtyInput" min={1} max={99} value={qty} onChange={(e) => {
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

                  <button type="button" className="productoQtyBtn" onClick={() => setQty((q) => Math.min(99, q + 1))}>+</button>
                </div>
              </div>

              {/* ADD TO CART */}
              <button type="button" className="productoAddBtn" onClick={addToCart} disabled={!canAdd} title={!canAdd ? "Selecciona una talla" : ""}>
                AÑADIR AL CARRITO
              </button>

            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductoDetalle;
