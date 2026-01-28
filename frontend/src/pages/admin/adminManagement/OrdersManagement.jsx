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
  productos: [],
};

function OrdersManagement() {
  return (
    <AdminCrudPage
      title="Pedidos"
      subtitle="Gestión de pedidos."
      entityName="pedido"
      listPath="/api/pedidos"

      // ✅ quitamos crear y borrar (si tu AdminCrudPage oculta botones cuando es null)
      createPath={null}
      deletePath={null}

      // ✅ solo permitimos update para cambiar estado / ver detalle
      updatePath={(id) => `/api/pedidos/${id}`}
      editLabel="Editar / Detalles"
      requireAdmin
      emptyForm={emptyPedido}
      searchKeys={["id", "codigo_pedido", "estado", "precio_total", "created_at"]}
      columns={[
        { key: "id", header: "ID", className: "adminMono" },
        { key: "codigo_pedido", header: "Código" },
        { key: "estado", header: "Estado" },
        { key: "precio_total", header: "Total", className: "text-end", render: (v) => money(v) },
        { key: "created_at", header: "Creado", render: (v) => dateTime(v) },
        // ✅ fuera la columna líneas como pediste
      ]}
      columnsGridCss={`
        grid-template-columns:
          220px
          160px
          140px
          190px
          200px;
        min-width: 860px;
      `}
      formFields={[
        // ✅ solo lectura
        { name: "codigo_pedido", label: "Código pedido", type: "text", full: true, disabled: true },

        // ✅ editable
        {
          name: "estado",
          label: "Estado",
          type: "select",
          options: ["pendiente", "enviado", "entregado", "cancelado"].map((s) => ({ value: s, label: s })),
        },

        // ✅ solo lectura
        { name: "precio_total", label: "Precio total (€)", type: "number", step: "0.01", disabled: true },

        // ✅ detalle de líneas (solo lectura)
        { name: "productos", label: "Productos del pedido", type: "orderLines", full: true },
      ]}
      buildPayload={(f) => ({
        // ✅ solo cambiamos estado (lo demás no se toca)
        estado: f.estado,
      })}
    />
  );
}

export default OrdersManagement;
