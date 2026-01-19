import AdminCrudPage from "../components/AdminCrudPage";
import "../AdminManagement.css";

const money = (v) => {
  const n = typeof v === "number" ? v : Number(v);
  if (Number.isNaN(n)) return "-";
  return n.toFixed(2) + " €";
};
const dateTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString("es-ES");
};

const emptyPedido = {
  id: null,
  codigo_pedido: "",
  estado: "pendiente",
  precio_total: "",
};

function OrdersManagement() {
  return (
    <AdminCrudPage
      title="Pedidos"
      subtitle="Gestión de pedidos."
      entityName="pedido"
      listPath="/api/pedidos"
      createPath="/api/pedidos"
      updatePath={(id) => `/api/pedidos/${id}`}
      deletePath={(id) => `/api/pedidos/${id}`}
      requireAdmin
      emptyForm={emptyPedido}
      searchKeys={["id", "codigo_pedido", "estado", "precio_total", "created_at"]}
      columns={[
        { key: "id", header: "ID", className: "adminMono" },
        { key: "codigo_pedido", header: "Código" },
        { key: "estado", header: "Estado" },
        { key: "precio_total", header: "Total", className: "text-end", render: (v) => money(v) },
        { key: "created_at", header: "Creado", render: (v) => dateTime(v) },
        {
          key: "productos",
          header: "Líneas",
          render: (v) => (Array.isArray(v) ? v.length : "-"),
        },
      ]}
      columnsGridCss={`
        grid-template-columns:
          70px
          220px
          140px
          120px
          190px
          120px
          170px;
        min-width: 900px;
      `}
      formFields={[
        { name: "codigo_pedido", label: "Código pedido", type: "text", full: true },
        {
          name: "estado",
          label: "Estado",
          type: "select",
          options: ["pendiente", "enviado", "entregado", "cancelado"].map((s) => ({ value: s, label: s })),
        },
        { name: "precio_total", label: "Precio total (€)", type: "number", step: "0.01" },
      ]}
      buildPayload={(f) => ({
        codigo_pedido: f.codigo_pedido,
        estado: f.estado,
        precio_total: f.precio_total === "" ? 0 : Number(f.precio_total),
      })}
    />
  );
}

export default OrdersManagement;