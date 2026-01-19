import AdminCrudPage from "../components/AdminCrudPage";
import "../AdminManagement.css";

const money = (v) => {
  const n = typeof v === "number" ? v : Number(v);
  if (Number.isNaN(n)) return "-";
  return n.toFixed(2) + " €";
};
const yesNo = (v) => (String(v) === "1" || v === 1 || v === true ? "Sí" : "No");

const emptyProducto = {
  id: null,
  nombre: "",
  descripcion: "",
  tallas_disponibles: "",
  precio: "",
  slug: "",
  activo: 1,
  // OJO: tu Resource devuelve "tipo" como objeto, pero para crear/editar normalmente enviarás tipo_id.
  tipo_id: "",
};

function ProductsManagement() {
  return (
    <AdminCrudPage
      title="Productos"
      subtitle="Gestión de catálogo."
      entityName="producto"
      listPath="/api/productos"
      createPath="/api/productos"
      updatePath={(id) => `/api/productos/${id}`}
      deletePath={(id) => `/api/productos/${id}`}
      requireAdmin
      emptyForm={emptyProducto}
      searchKeys={["id", "nombre", "descripcion", "tallas_disponibles", "precio", "slug", "activo"]}
      columns={[
        { key: "id", header: "ID", className: "adminMono" },
        { key: "nombre", header: "Nombre" },
        {
          key: "tipo",
          header: "Tipo",
          render: (_, row) => row?.tipo?.nombre ?? "-",
        },
        { key: "precio", header: "Precio", className: "text-end", render: (v, row) => row?.precio_formateado ?? money(v) },
        { key: "activo", header: "Activo", render: (v) => yesNo(v) },
        { key: "slug", header: "Slug", className: "adminTruncate", title: (v) => v || "" },
        { key: "tallas_disponibles", header: "Tallas", className: "adminTruncate", title: (v) => v || "" },
        { key: "descripcion", header: "Descripción", className: "adminTruncate", title: (v) => v || "" },
      ]}
      columnsGridCss={`
        grid-template-columns:
          70px
          220px
          160px
          120px
          110px
          220px
          200px
          1.6fr
          170px;
        min-width: 1100px;
      `}
      formFields={[
        { name: "nombre", label: "Nombre", type: "text", full: true },
        { name: "precio", label: "Precio (€)", type: "number", step: "0.01" },
        { name: "activo", label: "Activo", type: "select", options: [{ value: 1, label: "Sí" }, { value: 0, label: "No" }] },
        { name: "slug", label: "Slug", type: "text", full: true },
        { name: "tallas_disponibles", label: "Tallas disponibles", type: "text", full: true, placeholder: "S,M,L,XL..." },
        { name: "descripcion", label: "Descripción", type: "textarea", full: true, rows: 5 },
        // Si en tu backend esperas tipo_id:
        { name: "tipo_id", label: "Tipo (ID)", type: "number" },
      ]}
      buildPayload={(f) => ({
        nombre: f.nombre,
        descripcion: f.descripcion,
        tallas_disponibles: f.tallas_disponibles,
        precio: f.precio === "" ? 0 : Number(f.precio),
        slug: f.slug,
        activo: String(f.activo) === "1" || f.activo === 1 ? 1 : 0,
        tipo_id: f.tipo_id === "" ? null : Number(f.tipo_id),
      })}
    />
  );
}

export default ProductsManagement;