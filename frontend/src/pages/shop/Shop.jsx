import { useEffect, useMemo, useState } from "react";
import "./Shop.css";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const TIPOS_FIJOS = [
    { id: 1, nombre: "Ropa" },
    { id: 2, nombre: "Discos" },
    { id: 3, nombre: "Accesorios" },
    { id: 4, nombre: "Otros" },
];

const ORDER_OPTIONS = [
    { value: "newest", label: "Más nuevo" },
    { value: "oldest", label: "Más antiguo" },
    { value: "price_asc", label: "Precio: menor a mayor" },
    { value: "price_desc", label: "Precio: mayor a menor" },
];

function Tienda() {
    const [productos, setProductos] = useState([]);
    const [productosAll, setProductosAll] = useState([]);
    const [loading, setLoading] = useState(true);


    const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
    const [order, setOrder] = useState("newest");

    const tipos = TIPOS_FIJOS;

    const countByTipo = useMemo(() => {
        const map = new Map();
        for (const t of tipos) map.set(t.id, 0);

        for (const p of productosAll) {
            const id = p?.tipo?.id ?? p?.tipo_producto_id;
            if (id != null) map.set(id, (map.get(id) || 0) + 1);
        }

        return map;
    }, [productosAll, tipos]);

    useEffect(() => {
        const controller = new AbortController();

        const loadAll = async () => {
            try {
                const params = new URLSearchParams();
                params.set("order", "newest");

                const res = await fetch(`${API_URL}/productos?${params.toString()}`, {
                    headers: { Accept: "application/json" },
                    signal: controller.signal,
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const json = await res.json();
                const data = Array.isArray(json) ? json : (json?.data ?? []);
                setProductosAll(data);
            } catch (e) {
                if (e.name !== "AbortError") console.error("Error cargando productosAll:", e);
            }
        };

        loadAll();
        return () => controller.abort();
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        const load = async () => {
            try {
                setLoading(true);

                const params = new URLSearchParams();
                params.set("order", order);
                if (tipoSeleccionado) params.set("tipo", String(tipoSeleccionado));

                const res = await fetch(`${API_URL}/productos?${params.toString()}`, {
                    headers: { Accept: "application/json" },
                    signal: controller.signal,
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const json = await res.json();
                const data = Array.isArray(json) ? json : (json?.data ?? []);
                setProductos(data);
            } catch (e) {
                if (e.name !== "AbortError") {
                    console.error("Error cargando productos:", e);
                    setProductos([]);
                }
            } finally {
                setLoading(false);
            }
        };

        load();
        return () => controller.abort();
    }, [tipoSeleccionado, order, API_URL]);

    const totalItems = productos.length;

    return (
        <section className="container">
            <div className="container tiendaContainer">
                <div className="d-flex tiendaLayout gap-4">
                    <aside className="tiendaSidebar">
                        <h3 className="tiendaSidebarTitle">CATEGORIAS</h3>
                        <ul className="tiendaCats list-unstyled">
                            <li>
                                <button type="button" className={`tiendaCatBtn ${tipoSeleccionado === null ? "isActive" : ""}`} onClick={() => setTipoSeleccionado(null)}>
                                    Todos
                                    <span className="tiendaCatCount">{productosAll.length}</span>
                                </button>
                            </li>
                            {tipos.map((t) => {
                                const count = countByTipo.get(t.id) || 0;
                                return (
                                    <li key={t.id}>
                                        <button
                                            type="button"
                                            className={`tiendaCatBtn ${tipoSeleccionado === t.id ? "isActive" : ""}`}
                                            onClick={() => setTipoSeleccionado(t.id)}
                                        >
                                            {t.nombre}
                                            <span className="tiendaCatCount">{count}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </aside>

                    <div className="tiendaMain flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center tiendaTopbar gap-3">
                            <div className="tiendaItemsCount">
                                {loading ? "Cargando..." : `${totalItems} productos`}
                            </div>

                            <div className="d-flex align-items-center gap-2">
                                <label className="tiendaSortLabel" htmlFor="sortBy">Filtrar por</label>
                                <select id="sortBy" className="form-select tiendaSortSelect" value={order} onChange={(e) => setOrder(e.target.value)}>
                                    {ORDER_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="tiendaLoading">Cargando productos...</div>
                        ) : totalItems === 0 ? (
                            // <div className="tiendaEmpty">No hay productos para mostrar.</div>
                            <div className="tiendaEmpty"></div>
                        ) : (
                            <div className="row row-cols-1 row-cols-md-3 g-4">
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
            </div>
        </section>
    );
}

export default Tienda;