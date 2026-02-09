import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Cart.css";

const CART_ITEMS = "cartItems";

function loadCart() {
    try {
        const raw = localStorage.getItem(CART_ITEMS);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function Cart() {
    // ✅ cargar 1 vez, sin efecto (evita que se pise el storage)
    const [cartItems, setCartItems] = useState(() => loadCart());

    // ✅ para no guardar en el primer render
    const didMount = useRef(false);

    useEffect(() => {
        if (!didMount.current) {
            didMount.current = true;
            return;
        }
        localStorage.setItem(CART_ITEMS, JSON.stringify(cartItems));
    }, [cartItems]);

    const { count, total } = useMemo(() => {
        const c = cartItems.reduce((acc, it) => acc + (Number(it.qty) || 0), 0);
        const t = cartItems.reduce(
            (acc, it) => acc + (Number(it.precio) || 0) * (Number(it.qty) || 0),
            0
        );
        return { count: c, total: t };
    }, [cartItems]);

    const totalFormateado = new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
    }).format(total);

    const setQty = (id, talla, qty) => {
        const q = Math.max(1, Number(qty || 1));
        setCartItems((prev) =>
            prev.map((it) =>
                it.id === id && (it.talla ?? null) === (talla ?? null) ? { ...it, qty: q } : it
            )
        );
    };

    const removeItem = (id, talla) =>
        setCartItems((prev) =>
            prev.filter((it) => !(it.id === id && (it.talla ?? null) === (talla ?? null)))
        );

    const clearCart = () => setCartItems([]);

    const incQty = (id) => {
        setCartItems((prev) =>
            prev.map((it) =>
                it.id === id ? { ...it, qty: (Number(it.qty) || 1) + 1 } : it
            )
        );
    };

    const decQty = (id) => {
        setCartItems((prev) =>
            prev.map((it) =>
                it.id === id
                    ? { ...it, qty: Math.max(1, (Number(it.qty) || 1) - 1) }
                    : it
            )
        );
    };


    return (
        <section className="cartPage">
            <div className="cartHeader">
                <h1>Carrito</h1>
                <div className="cartHeaderRight">
                    <span className="cartMuted">{count} artículo(s)</span>
                    {cartItems.length > 0 && (
                        <button className="cartBtn cartBtnGhost" onClick={clearCart}>
                            Vaciar
                        </button>
                    )}
                </div>
            </div>

            {cartItems.length === 0 ? (
                <div className="cartEmpty">
                    <p>No tienes nada en el carrito.</p>
                    <p className="cartMuted">Añade productos desde la tienda.</p>
                </div>
            ) : (
                <div className="cartGrid">
                    <div className="cartItems">
                        {cartItems.map((it) => (
                            <div className="cartItem" key={`${it.id}-${it.talla ?? "nosize"}`}>
                                <div className="cartItemImg">
                                    <img
                                        src={it.imagen ?? "/images/productos/camiseta01.png"}
                                        alt={it.nombre}
                                        loading="lazy"
                                    />
                                </div>

                                <div className="cartItemInfo">
                                    <div className="cartItemTop">
                                        <div>
                                            <div className="d-flex gap-3">
                                                <div className="cartItemName">{it.nombre}</div>
                                                {it.talla && (
                                                    <div className="cartItemMeta">Talla {it.talla}</div>
                                                )}

                                            </div>
                                            <div className="cartMuted">
                                                {typeof it.precio_formateado === "string"
                                                    ? it.precio_formateado
                                                    : `${Number(it.precio || 0).toFixed(2)} €`}
                                            </div>
                                        </div>

                                        <button className="cartBtn cartBtnDanger" onClick={() => removeItem(it.id, it.talla)}>
                                            Quitar
                                        </button>

                                    </div>

                                    <div className="cartItemBottom">
                                        <div className="cartQty">
                                            <label className="cartMuted">Cantidad</label>

                                            <div className="cartQtyControls">
                                                <button
                                                    type="button"
                                                    className="cartQtyBtn"
                                                    onClick={() => decQty(it.id)}
                                                >
                                                    −
                                                </button>

                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={it.qty ?? 1}
                                                    onChange={(e) => setQty(it.id, it.talla, e.target.value)}
                                                    disabled
                                                />


                                                <button
                                                    type="button"
                                                    className="cartQtyBtn"
                                                    onClick={() => incQty(it.id)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>


                                        <div className="cartPrice">
                                            <span className="cartMuted">Subtotal</span>
                                            <span className="cartPriceValue">
                                                {new Intl.NumberFormat("es-ES", {
                                                    style: "currency",
                                                    currency: "EUR",
                                                }).format((Number(it.precio) || 0) * (Number(it.qty) || 0))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <aside className="cartSummary">
                        <h2>Resumen</h2>
                        <div className="cartSummaryRow">
                            <span className="cartMuted">Total</span>
                            <strong>{totalFormateado}</strong>
                        </div>
                        <Link to="/checkout" className="cartBtn cartBtnPrimary d-flex justify-content-center align-items-center">Ir a pagar</Link>
                    </aside>
                </div>
            )}
        </section>
    );
}

export default Cart;