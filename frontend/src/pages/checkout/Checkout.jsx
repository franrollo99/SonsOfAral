import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

const API_URL = import.meta.env.VITE_API_URL;
const CART_ITEMS = "cartItems";
const SHIPPING_FEE = 5;

function loadCart() {
    try {
        const raw = localStorage.getItem(CART_ITEMS);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function getToken() {
    return localStorage.getItem("token");
}

export default function Checkout() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState(() => loadCart());

    const [form, setForm] = useState({
        nombre_envio: "",
        telefono: "666777888",
        direccion: "",
        municipio: "",
        provincia: "",
        cp: "",
        card_name: "Francisco",
        card_number: "5454 5454 5454 5454",
        card_exp: "12/28",
        card_cvc: "123"
    });


    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = getToken();
        if (!token) return;

        (async () => {
            try {
                const res = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) return;

                const u = data?.data?.user;

                setForm((p) => ({
                    ...p,
                    nombre_envio: p.nombre_envio || `${u?.nombre ?? ""} ${u?.apellidos ?? ""}`.trim(),
                    direccion: p.direccion || u?.direccion || "",
                    municipio: p.municipio || u?.municipio || "",
                    provincia: p.provincia || u?.provincia || "",
                    cp: p.cp || u?.cp || "",
                }));
            } catch { }
        })();
    }, []);

    const { subtotal, totalItems } = useMemo(() => {
        const sub = cartItems.reduce(
            (acc, it) => acc + (Number(it.precio) || 0) * (Number(it.qty) || 0),
            0
        );
        const count = cartItems.reduce((acc, it) => acc + (Number(it.qty) || 0), 0);
        return { subtotal: sub, totalItems: count };
    }, [cartItems]);

    const total = subtotal + SHIPPING_FEE;

    const money = (n) =>
        new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(
            Number(n || 0)
        );

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
    };

    const onlyDigits = (s) => (s || "").replace(/\D/g, "");
    const isValidExp = (s) => /^(0[1-9]|1[0-2])\/\d{2}$/.test((s || "").trim());
    const isValidCvc = (s) => /^\d{3,4}$/.test(onlyDigits(s));

    const validate = () => {
        if (!form.nombre_envio.trim()) return "Falta el nombre para el envío.";
        if (!form.direccion.trim()) return "Falta la dirección.";
        if (!form.municipio.trim()) return "Falta el municipio.";
        if (!form.provincia.trim()) return "Falta la provincia.";
        if (!form.cp.trim()) return "Falta el código postal.";

        if (!form.card_name.trim()) return "Falta el nombre de la tarjeta.";
        const num = onlyDigits(form.card_number);
        if (num.length !== 16) return "El número de tarjeta debe tener 16 dígitos.";
        if (!isValidExp(form.card_exp)) return "La caducidad debe tener formato MM/AA.";
        if (!isValidCvc(form.card_cvc)) return "El CVC no es válido.";

        if (cartItems.length === 0) return "El carrito está vacío.";
        return "";
    };


    const handlePay = async () => {
        setError("");
        const msg = validate();
        if (msg) {
            setError(msg);
            return;
        }

        const token = getToken();
        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                nombre_envio: form.nombre_envio,
                telefono: form.telefono || null,
                direccion: form.direccion,
                municipio: form.municipio,
                provincia: form.provincia,
                cp: form.cp,
                metodo_pago: "tarjeta",
                gastos_envio: SHIPPING_FEE,
                items: cartItems.map((it) => ({ id: it.id, qty: Number(it.qty) || 1, talla: it.talla ?? null })),
            };

            const res = await fetch(`${API_URL}/pedidos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                const message =
                    data?.message ||
                    (Array.isArray(data?.errors) ? data.errors.join(" | ") : "") ||
                    "No se pudo completar el pago.";
                throw new Error(message);
            }

            localStorage.removeItem(CART_ITEMS);
            const pedidoId = data?.data?.id ?? data?.id;
            navigate(`/checkout/success/${pedidoId}`, { replace: true });
        } catch (err) {
            setError(err?.message || "Error inesperado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section>
            <div className="checkoutHeader d-flex justify-content-between align-items-center gap-3">
                <h1>Pago</h1>
            </div>

            <div className="checkoutGrid">
                <div className="checkoutCard">
                    <h2>Datos de envío</h2>

                    {error && <div className="checkoutError">{error}</div>}

                    <div className="checkoutForm">
                        <div className="checkoutField">
                            <label>Nombre y apellidos</label>
                            <input
                                name="nombre_envio"
                                value={form.nombre_envio}
                                onChange={onChange}
                            />
                        </div>

                        <div className="checkoutField">
                            <label>Teléfono de contacto</label>
                            <input
                                name="telefono"
                                value={form.telefono}
                                onChange={onChange}
                            />
                        </div>

                        <div className="checkoutField">
                            <label>Dirección</label>
                            <input
                                name="direccion"
                                value={form.direccion}
                                onChange={onChange}
                            />
                        </div>

                        <div className="d-flex flex-column flex-md-row gap-3">
                            <div className="checkoutField checkoutFieldGrow">
                                <label>Municipio</label>
                                <input
                                    name="municipio"
                                    value={form.municipio}
                                    onChange={onChange}
                                />
                            </div>

                            <div className="checkoutField checkoutFieldGrow">
                                <label>Provincia</label>
                                <input
                                    name="provincia"
                                    value={form.provincia}
                                    onChange={onChange}
                                />
                            </div>

                            <div className="checkoutField checkoutFieldCP">
                                <label>CP</label>
                                <input
                                    name="cp"
                                    value={form.cp}
                                    onChange={onChange}
                                />
                            </div>
                        </div>
                    </div>

                    <h2 className="checkoutSectionTitle">Datos de la tarjeta</h2>

                    <div className="checkoutForm">
                        <div className="checkoutField"><label>Nombre</label><input name="card_name" value={form.card_name} onChange={onChange} /></div>
                        <div className="checkoutField"><label>Número de tarjeta</label><input name="card_number" value={form.card_number} onChange={onChange} inputMode="numeric" /></div>
                        <div className="d-flex flex-column flex-md-row gap-3">
                            <div className="checkoutField checkoutFieldGrow"><label>Caducidad (MM/AA)</label><input name="card_exp" value={form.card_exp} onChange={onChange} inputMode="numeric" /></div>
                            <div className="checkoutField checkoutFieldCP"><label>CVC</label><input name="card_cvc" value={form.card_cvc} onChange={onChange} inputMode="numeric" /></div>
                        </div>
                    </div>

                </div>

                <aside className="checkoutCard">
                    <h2>Resumen</h2>

                    <div className="checkoutSummaryList">
                        {cartItems.map((it) => (
                            <div
                                className="checkoutSummaryRow d-flex justify-content-between align-items-center gap-3"
                                key={`${it.id}-${it.talla ?? "nosize"}`}
                            >
                                <div>
                                    <div className="checkoutItemName d-flex align-items-center gap-2">
                                        <span>{it.nombre}</span>
                                        {it.talla && <span className="checkoutBadge">Talla {it.talla}</span>}
                                        <span className="checkoutMuted">x{it.qty}</span>
                                    </div>
                                    <div className="checkoutMuted checkoutSmall">
                                        {typeof it.precio_formateado === "string"
                                            ? it.precio_formateado
                                            : `${Number(it.precio || 0).toFixed(2)} €`}
                                    </div>
                                </div>

                                <strong>{money((Number(it.precio) || 0) * (Number(it.qty) || 0))}</strong>
                            </div>
                        ))}
                    </div>

                    <div className="checkoutTotals">
                        <div className="checkoutLine d-flex justify-content-between align-items-center gap-3">
                            <span className="checkoutMuted">Subtotal</span>
                            <span>{money(subtotal)}</span>
                        </div>

                        <div className="checkoutLine d-flex justify-content-between align-items-center gap-3">
                            <span className="checkoutMuted">Envío / gestión</span>
                            <span>{money(SHIPPING_FEE)}</span>
                        </div>

                        <div className="checkoutLine checkoutLineTotal d-flex justify-content-between align-items-center gap-3">
                            <span>Total</span>
                            <strong>{money(total)}</strong>
                        </div>
                    </div>

                    <button
                        className="checkoutBtnPrimary"
                        onClick={handlePay}
                        disabled={loading}
                    >
                        {loading ? "Procesando..." : "Pagar"}
                    </button>

                    <button
                        className="checkoutBtnGhost"
                        onClick={() => navigate("/carrito")}
                        disabled={loading}
                    >
                        Volver al carrito
                    </button>
                </aside>
            </div>
        </section>
    );
}
