import AdminCrudPage from "../components/AdminCrudPage";
import "../AdminManagement.css";

const emptyUser = {
  id: null,
  nombre: "",
  apellidos: "",
  email: "",
  rol: "",
  created_at: "",
};

function UsersManagement() {
  return (
    <AdminCrudPage
      title="Usuarios"
      entityName="usuario"
      listPath="/usuarios"
      requireAdmin
      emptyForm={emptyUser}
      searchKeys={["id", "nombre", "apellidos", "email"]}


      columns={[
        { key: "id", header: "ID", className: "adminMono" },
        { key: "nombre", header: "Nombre" },
        { key: "apellidos", header: "Apellidos" },
        { key: "email", header: "Email", className: "adminTruncate", title: (v) => v || "" },
        { key: "rol", header: "Rol" },
        { key: "created_at", header: "Alta" },
      ]}
      columnsGridCss={`
        grid-template-columns:
          70px
          1.1fr
          1.3fr
          1.6fr
          100px
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

        { name: "rol", label: "Rol", type: "text", disabled: true },
        { name: "created_at", label: "Fecha de alta", type: "text", disabled: true },
      ]}

      buildPayload={() => ({})}
    />
  );
}

export default UsersManagement;
