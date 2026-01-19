import AdminCrudPage from "../components/AdminCrudPage";
import "../AdminManagement.css";

const emptyTipo = { id: null, nombre: "" };

function ProductTypesManagement() {
  return (
    <AdminCrudPage
      title="Tipos de producto"
      subtitle="Gestión de categorías/tipos."
      entityName="tipo"
      listPath="/api/tipos-producto"
      createPath="/api/tipos-producto"
      updatePath={(id) => `/api/tipos-producto/${id}`}
      deletePath={(id) => `/api/tipos-producto/${id}`}
      requireAdmin
      emptyForm={emptyTipo}
      searchKeys={["id", "nombre"]}
      columns={[
        { key: "id", header: "ID", className: "adminMono" },
        { key: "nombre", header: "Nombre" },
      ]}
      columnsGridCss={`
        grid-template-columns: 80px 1fr 170px;
        min-width: 520px;
      `}
      formFields={[
        { name: "nombre", label: "Nombre", type: "text", full: true },
      ]}
      buildPayload={(f) => ({ nombre: f.nombre })}
    />
  );
}

export default ProductTypesManagement;