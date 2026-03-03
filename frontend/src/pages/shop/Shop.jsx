import { useEffect, useMemo, useState } from "react";
import "./Shop.css";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const ORDER_OPTIONS = [
  { value: "newest", label: "Más nuevo" },
  { value: "oldest", label: "Más antiguo" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a mayor" },
];

const LS_KEYS = {
  productos: "productos",
  tipos: "tipos-productos",
};

const TTL_MS = 5 * 60 * 1000;

function readCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (!("ts" in parsed) || !("data" in parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch { }
}

function isFresh(ts) {
  return typeof ts === "number" && Date.now() - ts < TTL_MS;
}

function Tienda() {
  const [productosAll, setProductosAll] = useState([]);
  const [tiposAll, setTiposAll] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [order, setOrder] = useState("newest");

  useEffect(() => {
    const cachedProd = readCache(LS_KEYS.productos);
    const cachedTipos = readCache(LS_KEYS.tipos);

    const hasAnyCache = Boolean(cachedProd?.data || cachedTipos?.data);

    if (Array.isArray(cachedProd?.data)) setProductosAll(cachedProd.data);
    if (Array.isArray(cachedTipos?.data)) setTiposAll(cachedTipos.data);

    setLoading(!hasAnyCache);

    const controller = new AbortController();

    const loadFresh = async () => {
      try {
        const [prodData, tiposData] = await Promise.all([
          fetch(`${API_URL}/productos`, {
            headers: { Accept: "application/json" },
            signal: controller.signal,
          }).then(async (r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status} (productos)`);
            const json = await r.json();
            return Array.isArray(json) ? json : (json?.data ?? []);
          }),
          fetch(`${API_URL}/tipos-productos`, {
            headers: { Accept: "application/json" },
            signal: controller.signal,
          }).then(async (r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status} (tipos)`);
            const json = await r.json();
            return Array.isArray(json) ? json : (json?.data ?? []);
          }),
        ]);

        setProductosAll(prodData);
        setTiposAll(tiposData);

        writeCache(LS_KEYS.productos, prodData);
        writeCache(LS_KEYS.tipos, tiposData);
      } catch (e) {
        if (e?.name !== "AbortError") console.error("Error cargando tienda:", e);
      } finally {
        setLoading(false);
      }
    };

    loadFresh();

    return () => controller.abort();
  }, []);

  const countByTipo = useMemo(() => {
    const map = new Map();
    for (const p of productosAll) {
      const id = p?.tipo?.id ?? p?.tipo_producto_id;
      if (id != null) map.set(id, (map.get(id) || 0) + 1);
    }
    return map;
  }, [productosAll]);

  const tiposVisibles = useMemo(() => {
    const list = (Array.isArray(tiposAll) ? tiposAll : [])
      .map((t) => ({
        id: t.id,
        nombre: t.nombre ?? t.name ?? `Tipo ${t.id}`,
        count: countByTipo.get(t.id) || 0,
      }))
      .filter((t) => t.count > 0);

    return list;
  }, [tiposAll, countByTipo]);

  useEffect(() => {
    if (tipoSeleccionado === null) return;
    const ok = tiposVisibles.some((t) => t.id === tipoSeleccionado);
    if (!ok) setTipoSeleccionado(null);
  }, [tipoSeleccionado, tiposVisibles]);

  const productos = useMemo(() => {
    let list = productosAll;

    if (tipoSeleccionado !== null) {
      list = list.filter((p) => {
        const id = p?.tipo?.id ?? p?.tipo_producto_id;
        return id === tipoSeleccionado;
      });
    }

    const getTime = (p) => {
      const raw = p?.created_at ?? p?.createdAt ?? p?.fecha_creacion ?? null;
      const t = raw ? Date.parse(raw) : NaN;
      return Number.isFinite(t) ? t : 0;
    };

    const getPrice = (p) => {
      const n = Number(p?.precio);
      return Number.isFinite(n) ? n : 0;
    };

    const sorted = [...list];

    if (order === "newest") sorted.sort((a, b) => getTime(b) - getTime(a));
    if (order === "oldest") sorted.sort((a, b) => getTime(a) - getTime(b));
    if (order === "price_asc") sorted.sort((a, b) => getPrice(a) - getPrice(b));
    if (order === "price_desc") sorted.sort((a, b) => getPrice(b) - getPrice(a));

    return sorted;
  }, [productosAll, tipoSeleccionado, order]);

  const totalItems = productos.length;
  const mobileTipoValue = tipoSeleccionado === null ? "all" : String(tipoSeleccionado);

  return (
    <section className="container tiendaContainer">
      <div className="d-flex tiendaLayout gap-4">
        <aside className="tiendaSidebar d-none d-md-block">
          <h3 className="tiendaSidebarTitle">CATEGORÍAS</h3>
          <ul className="tiendaCats list-unstyled">
            <li>
              <button
                type="button"
                className={`tiendaCatBtn ${tipoSeleccionado === null ? "isActive" : ""}`}
                onClick={() => setTipoSeleccionado(null)}
              >
                Todos
                <span className="tiendaCatCount">{productosAll.length}</span>
              </button>
            </li>

            {tiposVisibles.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className={`tiendaCatBtn ${tipoSeleccionado === t.id ? "isActive" : ""}`}
                  onClick={() => setTipoSeleccionado(t.id)}
                >
                  {t.nombre}
                  <span className="tiendaCatCount">{t.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="tiendaMain flex-grow-1">
          <div className="tiendaTopbar d-none d-md-flex justify-content-between align-items-center gap-3">
            <div className="tiendaItemsCount">
              {loading ? "Cargando..." : `${totalItems} productos`}
            </div>

            <div className="d-flex align-items-center gap-2">
              <label className="tiendaSortLabel" htmlFor="sortBy">Ordenar por</label>
              <select
                id="sortBy"
                className="form-select tiendaSortSelect"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              >
                {ORDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="tiendaTopbarMobile d-md-none">
            <div className="tiendaItemsCount mb-2">
              {loading ? "Cargando..." : `${totalItems} productos`}
            </div>

            <div className="row g-2">
              <div className="col-12">
                <label className="tiendaSortLabel" htmlFor="catBy">Categoría</label>
                <select
                  id="catBy"
                  className="form-select tiendaSortSelect w-100"
                  value={mobileTipoValue}
                  onChange={(e) => {
                    const v = e.target.value;
                    setTipoSeleccionado(v === "all" ? null : Number(v));
                  }}
                >
                  <option value="all">Todos ({productosAll.length})</option>
                  {tiposVisibles.map((t) => (
                    <option key={t.id} value={String(t.id)}>
                      {t.nombre} ({t.count})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12">
                <label className="tiendaSortLabel" htmlFor="sortByMobile">Ordenar por</label>
                <select
                  id="sortByMobile"
                  className="form-select tiendaSortSelect w-100"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                >
                  {ORDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="tiendaLoading">Cargando productos...</div>
          ) : totalItems === 0 ? (
            <div className="tiendaEmpty"></div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {productos.map((p) => (
                <div className="col" key={p.id}>
                  <Link
                    to={`/tienda/${p.slug}`}
                    state={{ producto: p }}
                    className="tiendaCardLink"
                  >
                    <article className="tiendaCard card">
                      <div className="tiendaImgWrap">
                        <img
                          className="tiendaImg"
                          src={p.imagen ?? "/images/productos/camiseta01.png"}
                          alt={p.nombre}
                          loading="lazy"
                        />
                      </div>

                      <div className="tiendaCardInfo">
                        <div className="tiendaName" title={p.nombre}>
                          {p.nombre}
                        </div>
                        <div className="tiendaPrice">
                          {typeof p.precio_formateado === "string"
                            ? p.precio_formateado
                            : `${Number(p.precio).toFixed(2)} €`}
                        </div>
                      </div>
                    </article>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Tienda;