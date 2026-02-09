import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../auth/Auth.css";
import "./ClientArea.css";

const API_URL = import.meta.env.VITE_API_URL;

function ClientArea() {
  const navigate = useNavigate();
  const token = useMemo(() => localStorage.getItem("token"), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    provincia: "",
    municipio: "",
    direccion: "",
    cp: "",
  });

  const [initialForm, setInitialForm] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveOk, setSaveOk] = useState("");
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [orders, setOrders] = useState([]);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [orderDetailError, setOrderDetailError] = useState("");

  // Cambiar contraseña
  const [showPwdSection, setShowPwdSection] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdOk, setPwdOk] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");

  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showNewPwd2, setShowNewPwd2] = useState(false);

  const authHeaders = useMemo(() => {
    return {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  }, [token]);

  const isDirty = useMemo(() => {
    if (!initialForm) return false;
    return (
      form.nombre !== initialForm.nombre ||
      form.apellidos !== initialForm.apellidos ||
      form.provincia !== initialForm.provincia ||
      form.municipio !== initialForm.municipio ||
      form.direccion !== initialForm.direccion ||
      form.cp !== initialForm.cp
    );
  }, [form, initialForm]);

  // 1) Cargar usuario (/auth/me)
  useEffect(() => {
    const run = async () => {
      setError("");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const meRes = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        const meData = await meRes.json();

        if (!meRes.ok) {
          // Token inválido / expirado / logout en otro sitio
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }

        // Si quieres bloquear admin aquí:
        // if (meData.user?.rol !== "cliente") navigate("/area-admin", { replace: true });

        setUser(meData.user);
        const u = meData.user;
        const next = {
          nombre: u?.nombre || "",
          apellidos: u?.apellidos || "",
          provincia: u?.provincia || "",
          municipio: u?.municipio || "",
          direccion: u?.direccion || "",
          cp: u?.cp || "",
        };

        setForm(next);
        setInitialForm(next);
      } catch (e) {
        setError("No se pudo cargar tu sesión. Reintenta.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [navigate, token]);

  // 2) Cargar pedidos del usuario
  useEffect(() => {
    if (!token) return;
    if (!user) return;

    const run = async () => {
      setOrdersError("");
      setOrdersLoading(true);

      try {
        const res = await fetch(`${API_URL}/pedidos`, {
          method: "GET",
          headers: authHeaders,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "No se pudieron cargar tus pedidos.");
        }

        const list = Array.isArray(data?.data) ? data.data : [];

        list.sort((a, b) => {
          const da = new Date(a?.created_at || 0).getTime();
          const db = new Date(b?.created_at || 0).getTime();
          return db - da;
        });

        setOrders(list);

      } catch (e) {
        setOrdersError(e.message || "Error cargando pedidos.");
      } finally {
        setOrdersLoading(false);
      }
    };

    run();
  }, [authHeaders, token, user]);

  const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", { year: "numeric", month: "2-digit", day: "2-digit" });
  };

  const formatMoney = (value) => {
    const num = typeof value === "number" ? value : Number(value);
    if (Number.isNaN(num)) return "-";
    return num.toFixed(2) + " €";
  };

  const estadoLabel = (estado) => {
    switch (estado) {
      case "pendiente": return "Pendiente";
      case "enviado": return "Enviado";
      case "entregado": return "Entregado";
      case "cancelado": return "Cancelado";
      default: return estado || "-";
    }
  };

  const openOrderModal = async (order) => {
    setSelectedOrder(null);
    setOrderDetailError("");
    setOrderDetailLoading(true);
    setModalOpen(true);

    try {
      // Puedes usar /{id} o /{codigo_pedido}. Ajusta a tu API.
      const res = await fetch(`${API_URL}/pedidos/${order.id}`, {
        method: "GET",
        headers: authHeaders,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "No se pudo cargar el detalle del pedido.");
      }

      // Espera:
      // data.pedido = { id, codigo_pedido, estado, precio_total, created_at, productos: [...] }
      setSelectedOrder(data?.data || null);
    } catch (e) {
      setOrderDetailError(e.message || "Error cargando detalle.");
    } finally {
      setOrderDetailLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
    setOrderDetailError("");
  };

  const onLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (e) {
      console.error("Error al cerrar sesión:", e);
    } finally {
      localStorage.removeItem("cartItems");
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
    }
  };


  const onChangePassword = async (e) => {
    e.preventDefault();
    setPwdError("");
    setPwdOk("");

    if (newPassword !== newPassword2) {
      setPwdError("La nueva contraseña no coincide.");
      return;
    }

    setPwdLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: currentPassword,
          password: newPassword,
          password_confirmation: newPassword2,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 422 && data?.errors) {
          const firstPwdError = data.errors?.password?.[0];
          const firstAnyError = Object.values(data.errors).flat()[0];

          throw new Error(firstPwdError || firstAnyError || "Datos inválidos.");
        }

        throw new Error(data?.message || "No se pudo cambiar la contraseña.");
      }

      setPwdOk("Contraseña actualizada.");
      setCurrentPassword("");
      setNewPassword("");
      setNewPassword2("");
      setShowPwdSection(false);
    } catch (e2) {
      setPwdError(e2.message || "Error cambiando contraseña.");
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="container areaClienteWrap">
        <div className="areaClienteCard">
          <h1 className="areaClienteTitle">Área de usuario</h1>
          <p className="areaClienteMuted">Cargando...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container areaClienteWrap">
        <div className="areaClienteCard">
          <h1 className="areaClienteTitle">Área de usuario</h1>
          <p className="userSessionError">{error}</p>
          <button className="userSessionBtn" onClick={() => navigate("/login")}>
            Volver al login
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="container">
      <div className="d-flex gap-4 areaClienteGrid">
        {/* Columna Izquierda */}
        <div className="areaClienteLeft">
          <div className="areaClienteCard">
            <div className="d-flex align-items-center justify-content-between">
              <h1 className="areaClienteTitle">Tu cuenta</h1>
              <button className="areaClienteLinkBtn" type="button" onClick={onLogout}>
                Cerrar sesión
              </button>
            </div>

            {/* Datos usuario (estilo login / Auth.css) */}
            <div className="userSessionForm">
              <div className={`flField ${user?.nombre ? "hasValue" : ""}`}>
                {/* <input className="flInput" value={user?.nombre || ""} readOnly /> */}
                <input className="flInput" value={form.nombre} onChange={(e) => { setSaveError(""); setSaveOk(""); setForm((p) => ({ ...p, nombre: e.target.value })); }} />
                <label className="flLabel">Nombre</label>
              </div>

              <div className={`flField ${user?.apellidos ? "hasValue" : ""}`}>
                <input className="flInput" value={form.apellidos} onChange={(e) => { setSaveError(""); setSaveOk(""); setForm((p) => ({ ...p, apellidos: e.target.value })); }} />
                {/* <input className="flInput" value={user?.apellidos || ""} readOnly /> */}
                <label className="flLabel">Apellidos</label>
              </div>

              <div className={`flField ${user?.email ? "hasValue" : ""}`}>
                <input className="flInput" value={user?.email || ""} readOnly />
                <label className="flLabel">Email</label>
              </div>

              <div className="d-flex gap-3">
                <div className={`flField flex-fill ${user?.provincia ? "hasValue" : ""}`}>
                  {/* <input className="flInput" value={user?.provincia || ""} readOnly /> */}
                  <input className="flInput" value={form.provincia} onChange={(e) => { setSaveError(""); setSaveOk(""); setForm((p) => ({ ...p, provincia: e.target.value })); }} />
                  <label className="flLabel">Provincia</label>
                </div>

                <div className={`flField flex-fill ${user?.municipio ? "hasValue" : ""}`}>
                  {/* <input className="flInput" value={user?.municipio || ""} readOnly /> */}
                  <input className="flInput" value={form.municipio} onChange={(e) => { setSaveError(""); setSaveOk(""); setForm((p) => ({ ...p, municipio: e.target.value })); }} />
                  <label className="flLabel">municipio</label>
                </div>
              </div>

              <div className={`flField ${user?.direccion ? "hasValue" : ""}`}>
                {/* <input className="flInput" value={user?.direccion || ""} readOnly /> */}
                <input className="flInput" value={form.direccion} onChange={(e) => { setSaveError(""); setSaveOk(""); setForm((p) => ({ ...p, direccion: e.target.value })); }} />
                <label className="flLabel">Dirección</label>
              </div>

              <div className={`flField ${user?.cp ? "hasValue" : ""}`}>
                {/* <input className="flInput" value={user?.cp || ""} readOnly /> */}
                <input className="flInput" value={form.cp} onChange={(e) => { setSaveError(""); setSaveOk(""); setForm((p) => ({ ...p, cp: e.target.value })); }} />
                <label className="flLabel">Código postal</label>
              </div>

              {saveOk && <p className="areaClienteOk">{saveOk}</p>}
              {saveError && <p className="userSessionError">{saveError}</p>}

              <button
                className="userSessionBtn"
                type="button"
                disabled={!isDirty || saveLoading}
                onClick={async () => {
                  setSaveError("");
                  setSaveOk("");
                  setSaveLoading(true);

                  try {
                    // OJO: este endpoint aún no existe. Lo crearemos luego.
                    const res = await fetch(`${API_URL}/auth/profile`, {
                      method: "PUT",
                      headers: authHeaders,
                      body: JSON.stringify(form),
                    });

                    const data = await res.json();

                    if (!res.ok) {
                      const msg =
                        data?.message ||
                        (data?.errors ? Object.values(data.errors).flat().join(" ") : "No se pudo guardar.");
                      throw new Error(msg);
                    }

                    setUser((prev) => ({ ...prev, ...form }));
                    setInitialForm(form);

                    setSaveOk("Datos actualizados.");
                  } catch (e) {
                    setSaveError(e.message || "Error guardando.");
                  } finally {
                    setSaveLoading(false);
                  }
                }}
              >
                {saveLoading ? "Guardando..." : "Guardar cambios"}
              </button>

            </div>

            {/* Cambiar contraseña */}
            <div className="areaClienteDivider" />

            <button
              className="areaClienteAccordionBtn"
              type="button"
              onClick={() => {
                setPwdError("");
                setPwdOk("");
                setShowPwdSection((v) => !v);
              }}
            >
              Cambiar contraseña
              <span className={`areaClienteChevron ${showPwdSection ? "open" : ""}`}>›</span>
            </button>

            {pwdOk && <p className="areaClienteOk">{pwdOk}</p>}
            {pwdError && <p className="userSessionError">{pwdError}</p>}

            {showPwdSection && (
              <form className="userSessionForm areaClientePwdForm" onSubmit={onChangePassword} noValidate>
                <div className={`flField ${currentPassword ? "hasValue" : ""}`}>
                  <input
                    className="flInput"
                    type={showCurrentPwd ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <label className="flLabel">Contraseña actual</label>

                  <button
                    type="button"
                    className="areaClienteEyeBtn"
                    onPointerDown={() => setShowCurrentPwd(true)}
                    onPointerUp={() => setShowCurrentPwd(false)}
                    onPointerLeave={() => setShowCurrentPwd(false)}
                    aria-label="Mostrar contraseña"
                  >
                    👁
                  </button>
                </div>

                <div className={`flField ${newPassword ? "hasValue" : ""}`}>
                  <input
                    className="flInput"
                    type={showNewPwd ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <label className="flLabel">Nueva contraseña</label>

                  <button
                    type="button"
                    className="areaClienteEyeBtn"
                    onPointerDown={() => setShowNewPwd(true)}
                    onPointerUp={() => setShowNewPwd(false)}
                    onPointerLeave={() => setShowNewPwd(false)}
                    aria-label="Mostrar contraseña"
                  >
                    👁
                  </button>
                </div>

                <div className={`flField ${newPassword2 ? "hasValue" : ""}`}>
                  <input
                    className="flInput"
                    type={showNewPwd2 ? "text" : "password"}
                    value={newPassword2}
                    onChange={(e) => setNewPassword2(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <label className="flLabel">Confirmar nueva contraseña</label>

                  <button type="button" className="areaClienteEyeBtn" onPointerDown={() => setShowNewPwd2(true)} onPointerUp={() => setShowNewPwd2(false)} onPointerLeave={() => setShowNewPwd2(false)} aria-label="Mostrar contraseña">
                    👁
                  </button>
                </div>

                <button className="userSessionBtn" type="submit" disabled={pwdLoading}>
                  {pwdLoading ? "Actualizando..." : "Actualizar contraseña"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Columna Derecha */}
        <div className="areaClienteRight">
          <div className="areaClienteCard areaClienteOrdersCard">
            <div className="d-flex align-items-center justify-content-between">
              <h2 className="areaClienteSubtitle">Tus pedidos</h2>
            </div>

            {ordersError && <p className="userSessionError">{ordersError}</p>}

            <div className="areaClienteOrdersTableWrap">
              <div className="areaClienteOrdersTableHead">
                <div>Pedido</div>
                <div>Fecha</div>
                <div>Estado</div>
                <div className="text-end">Total</div>
              </div>

              <div className="areaClienteOrdersScroll">
                {ordersLoading ? (
                  <p className="areaClienteMuted areaClientePad">Cargando pedidos...</p>
                ) : orders.length === 0 ? (
                  <p className="areaClienteMuted areaClientePad">Aún no has realizado pedidos.</p>
                ) : (
                  orders.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      className="areaClienteOrderRow"
                      onClick={() => openOrderModal(o)}
                    >
                      <div className="areaClienteOrderCode">
                        {o.codigo_pedido ? `#${o.codigo_pedido}` : `Pedido ${o.id}`}
                      </div>
                      <div>{formatDate(o.created_at)}</div>
                      <div>
                        <span className={`areaClienteBadge areaClienteBadge--${o.estado || "unknown"}`}>
                          {estadoLabel(o.estado)}
                        </span>
                      </div>
                      <div className="text-end">{formatMoney(o.precio_total)}</div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <p className="areaClienteHint">Pulsa sobre un pedido para ver los detalles.</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="areaClienteModalOverlay" role="dialog" aria-modal="true" onMouseDown={closeModal}>
          <div className="areaClienteModal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="d-flex align-items-start justify-content-between">
              <div>
                <h3 className="areaClienteModalTitle">
                  {selectedOrder?.codigo_pedido
                    ? `Pedido #${selectedOrder.codigo_pedido}`
                    : "Detalle de pedido"}
                </h3>
                <p className="areaClienteMuted areaClienteModalSub">
                  {selectedOrder?.created_at ? `Fecha: ${formatDate(selectedOrder.created_at)}` : ""}
                </p>
              </div>

              <button className="areaClienteModalClose" type="button" onClick={closeModal} aria-label="Cerrar">
                ✕
              </button>
            </div>

            {orderDetailLoading ? (
              <p className="areaClienteMuted areaClientePad">Cargando detalle...</p>
            ) : orderDetailError ? (
              <p className="userSessionError">{orderDetailError}</p>
            ) : !selectedOrder ? (
              <p className="areaClienteMuted areaClientePad">No hay datos del pedido.</p>
            ) : (
              <>
                <div className="areaClienteModalMeta">
                  <div>
                    <div className="areaClienteMetaLabel">Estado</div>
                    <div className={`areaClienteBadge areaClienteBadge--${selectedOrder.estado || "unknown"}`}>
                      {estadoLabel(selectedOrder.estado)}
                    </div>
                  </div>

                  <div className="text-end">
                    <div className="areaClienteMetaLabel">Total</div>
                    <div className="areaClienteTotal">{formatMoney(selectedOrder.precio_total)}</div>
                  </div>
                </div>

                <div className="areaClienteDivider" />

                <div className="areaClienteLinesHead">
                  <div>Producto</div>
                  <div>Talla</div>
                  <div className="text-end">Cant.</div>
                  <div className="text-end">Precio</div>
                  <div className="text-end">Subtotal</div>
                </div>

                <div className="areaClienteLinesScroll">
                  {(selectedOrder.productos || []).length === 0 ? (
                    <p className="areaClienteMuted areaClientePad">Este pedido no tiene líneas.</p>
                  ) : (
                    (selectedOrder.productos || []).map((p) => (
                      <div className="areaClienteLineRow" key={p.id}>
                        <div className="areaClienteLineName">{p.nombre_producto}</div>
                        <div>{p.talla || "-"}</div>
                        <div className="text-end">{p.cantidad}</div>
                        <div className="text-end">{formatMoney(p.precio_unitario_snapshot)}</div>
                        <div className="text-end">{formatMoney(p.subtotal)}</div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default ClientArea;
