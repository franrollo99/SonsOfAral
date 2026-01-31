import AdminCrudPage from "../components/AdminCrudPage";
import "../AdminManagement.css";

const emptyUser = {
  id: null,
  nombre: "",
  apellidos: "",
  email: "",
  direccion: "",
  municipio: "",
  provincia: "",
  cp: "",
  created_at: "",
  pedidos_count: 0,
};

function UsersManagement() {
  return (
    <AdminCrudPage
      title="Usuarios"
      subtitle="Listado y detalles de usuarios registrados."
      entityName="usuario"
      listPath="/api/usuarios"
      requireAdmin
      emptyForm={emptyUser}
      searchKeys={["id", "nombre", "apellidos", "email"]}


      columns={[
        { key: "id", header: "ID", className: "adminMono" },
        { key: "nombre", header: "Nombre" },
        { key: "apellidos", header: "Apellidos" },
        { key: "email", header: "Email", className: "adminTruncate", title: (v) => v || "" },
        { key: "pedidos_count", header: "Pedidos", className: "adminMono" },
        { key: "created_at", header: "Alta" },
      ]}
      columnsGridCss={`
        grid-template-columns:
          70px
          1.1fr
          1.3fr
          1.6fr
          110px
          140px;
        min-width: 980px;
      `}

      editLabel="Detalles"
      hideCreate
      hideDelete
      hideSave

      formFields={[
        { name: "nombre", label: "Nombre", type: "text", disabled: true, full: true },
        { name: "apellidos", label: "Apellidos", type: "text", disabled: true, full: true },
        { name: "email", label: "Email", type: "text", disabled: true, full: true },

        { name: "direccion", label: "Dirección", type: "text", disabled: true, full: true },
        { name: "municipio", label: "Municipio", type: "text", disabled: true },
        { name: "provincia", label: "Provincia", type: "text", disabled: true },
        { name: "cp", label: "CP", type: "text", disabled: true },

        { name: "created_at", label: "Fecha de alta", type: "text", disabled: true },
        { name: "pedidos_count", label: "Nº pedidos", type: "text", disabled: true },
      ]}

      buildPayload={() => ({})}
    />
  );
}

export default UsersManagement;
