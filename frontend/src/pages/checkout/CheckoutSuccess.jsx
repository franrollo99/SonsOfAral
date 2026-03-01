import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CheckoutSuccess.css";

const API_URL = import.meta.env.VITE_API_URL;

function getToken() { return localStorage.getItem("token"); }
function money(n) { return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(Number(n || 0)); }
function esc(s) { return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); }
function str(v) { return String(v ?? "").trim(); }
function num(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }

function normalizePedido(raw) {
  const p = raw?.data ?? raw?.pedido ?? raw ?? {};
  const productos = p.productos ?? p.lineas ?? p.pedido_productos ?? p.pedidoProductos ?? [];

  return {
    id: p.id ?? null,
    codigo_pedido: p.codigo_pedido ?? p.codigoPedido ?? "",
    estado: p.estado ?? "",
    nombre_envio: p.nombre_envio ?? p.nombreEnvio ?? "",
    direccion: p.direccion ?? "",
    municipio: p.municipio ?? "",
    provincia: p.provincia ?? "",
    cp: p.cp ?? "",
    metodo_pago: p.metodo_pago ?? p.metodoPago ?? "tarjeta",
    gastos_envio: p.gastos_envio ?? p.gastosEnvio ?? null,
    precio_total: p.precio_total ?? p.precioTotal ?? 0,
    productos: Array.isArray(productos) ? productos : [],
  };
}

export default function CheckoutSuccess() {
  const { pedidoId } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) { navigate("/login", { replace: true }); return; }

    (async () => {
      try {
        const res = await fetch(`${API_URL}/pedidos/${pedidoId}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "No se pudo cargar el pedido.");
        setPedido(normalizePedido(data));
      } catch (e) {
        setError(e?.message || "Error inesperado.");
      }
    })();
  }, [pedidoId, navigate]);

  const computed = useMemo(() => {
    if (!pedido) return null;

    const productos = pedido.productos.map((it) => ({
      nombre_producto: it.nombre_producto ?? it.nombreProducto ?? "",
      talla: it.talla ?? null,
      cantidad: it.cantidad ?? it.qty ?? it.quantity ?? 0,
      subtotal: it.subtotal ?? it.importe ?? it.total_linea ?? it.totalLinea ?? 0,
    }));

    const sumSubtotales = productos.reduce((acc, it) => acc + num(it.subtotal), 0);
    const total = num(pedido.precio_total);

    let envio = pedido.gastos_envio;
    if (envio === null || envio === undefined || envio === "") {
      const diff = total - sumSubtotales;
      envio = diff > 0 ? diff : 0;
    }

    const nombreEnvio = str(pedido.nombre_envio) || "Sin nombre de envío";
    const parts = [pedido.direccion, pedido.municipio, pedido.provincia, pedido.cp].map(str).filter(Boolean);
    const envioLinea = parts.length ? parts.join(", ") : "Sin datos de envío";

    const code = str(pedido.codigo_pedido) || String(pedido.id ?? "");
    const estado = str(pedido.estado) || "pendiente";

    return { productos, sumSubtotales, total, envio: num(envio), nombreEnvio, envioLinea, code, estado, metodo: str(pedido.metodo_pago) || "tarjeta" };
  }, [pedido]);

  const buildTicketHtml = () => {
    const p = computed;
    if (!p) return "";

    const rows = p.productos.map((it) => {
      const nombreProd = esc(it.nombre_producto);
      const talla = it.talla ? ` <span class="muted">(Talla ${esc(it.talla)})</span>` : "";
      return `<tr><td>${nombreProd}${talla}</td><td class="right">${esc(it.cantidad)}</td><td class="right">${esc(money(it.subtotal))}</td></tr>`;
    }).join("");

    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Ticket ${esc(p.code)}</title>
  <style>
    :root{--bg:#000;--bg-alt:#121212;--text:#EDEDED;--muted:#BFBFBF;}
    body{margin:0;padding:24px;font-family:Arial,Helvetica,sans-serif;background:var(--bg);color:var(--text);}
    .ticket{max-width:760px;margin:0 auto;background:var(--bg-alt);border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:18px;}
    h1{margin:0 0 8px 0;font-size:22px;}
    .muted{color:var(--muted);}
    .block{margin-top:12px;}
    table{width:100%;border-collapse:collapse;margin-top:12px;}
    th,td{padding:10px 6px;border-bottom:1px dashed rgba(255,255,255,.18);vertical-align:top;}
    th{text-align:left;}
    .right{text-align:right;}
    .totals{margin-top:14px;border-top:2px solid rgba(255,255,255,.22);padding-top:10px;}
    .row{display:flex;justify-content:space-between;margin:6px 0;}
    .big{font-size:18px;font-weight:800;}
    @media print{body{background:#fff;color:#000;padding:0} .ticket{background:#fff;border:0;border-radius:0} .muted{color:#444}}
  </style>
</head>
<body>
  <div class="ticket">
    <h1>Sons of Aral - Ticket</h1>
    <div class="muted">Pedido: #${esc(p.code)}</div>

    <div class="block">
      <strong>Envío:</strong><br/>
      ${esc(p.nombreEnvio)}<br/>
      <span class="muted">${esc(p.envioLinea)}</span>
    </div>

    <table>
      <thead><tr><th>Producto</th><th class="right">Cantidad</th><th class="right">Importe</th></tr></thead>
      <tbody>${rows || `<tr><td colspan="3" class="muted">Sin líneas</td></tr>`}</tbody>
    </table>

    <div class="totals">
      <div class="muted" style="margin-top:10px">Método pago: ${esc(p.metodo)}</div>
      <div class="row"><span class="muted">Envío/gestión</span><span>${esc(money(p.envio))}</span></div>
      <div class="row big"><span>Total</span><span>${esc(money(p.total))}</span></div>
    </div>
  </div>
</body>
</html>`;
  };

  const downloadTicket = () => {
    const html = buildTicketHtml();
    if (!html) return;

    const code = computed?.code || "ticket";
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ticket_${code}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <section className="successPage">
        <div className="successCard">
          <h1>Error</h1>
          <p className="successMuted">{error}</p>
          <button className="successBtn" onClick={() => navigate("/")}>Volver</button>
        </div>
      </section>
    );
  }

  if (!pedido || !computed) {
    return (
      <section className="successPage">
        <div className="successCard">
          <h1>Procesando...</h1>
          <p className="successMuted">Cargando pedido.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="successPage">
      <div className="successCard">
        <h1>Pago realizado correctamente</h1>
        <div className="d-flex gap-3 flex-wrap">
          <button className="successBtn" onClick={downloadTicket}>Descargar ticket de compra</button>
          <button className="successBtnGhost" onClick={() => navigate("/")}>Volver</button>
        </div>
      </div>
    </section>

  );
}
