import AdminCrudPage from "../components/AdminCrudPage";
import "../AdminManagement.css";

const emptyUser = {
  id: null,
  nombre: "",
  apellidos: "",
  email: "",
  rol: "client",
  direccion: "",
  municipio: "",
  provincia: "",
  cp: "",
};

function UsersManagement() {
  return (
    <AdminCrudPage
      title="Usuarios"
      subtitle="Gestión de usuarios."
      entityName="usuario"
      listPath="/api/usuarios"
      createPath="/api/usuarios"
      updatePath={(id) => `/api/usuarios/${id}`}
      deletePath={(id) => `/api/usuarios/${id}`}
      requireAdmin
      emptyForm={emptyUser}
      searchKeys={["id", "nombre", "apellidos", "email", "rol", "direccion", "municipio", "provincia", "cp"]}
      columns={[
        { key: "id", header: "ID", className: "adminMono" },
        { key: "nombre", header: "Nombre" },
        { key: "apellidos", header: "Apellidos" },
        { key: "email", header: "Email", className: "adminTruncate", title: (v) => v || "" },
        { key: "rol", header: "Rol" },
        { key: "provincia", header: "Provincia" },
        { key: "municipio", header: "Municipio" },
        { key: "cp", header: "CP" },
        { key: "direccion", header: "Dirección", className: "adminTruncate", title: (v) => v || "" },
      ]}
      columnsGridCss={`
        grid-template-columns:
          70px
          130px
          170px
          1.2fr
          110px
          140px
          140px
          90px
          1.6fr
          170px;
        min-width: 1050px;
      `}
      formFields={[
        { name: "nombre", label: "Nombre", type: "text" },
        { name: "apellidos", label: "Apellidos", type: "text" },
        { name: "email", label: "Email", type: "text", full: true },
        {
          name: "rol",
          label: "Rol",
          type: "select",
          options: [
            { value: "admin", label: "admin" },
            { value: "editor", label: "editor" },
            { value: "client", label: "client" },
          ],
        },
        { name: "provincia", label: "Provincia", type: "text" },
        { name: "municipio", label: "Municipio", type: "text" },
        { name: "cp", label: "Código postal", type: "text" },
        { name: "direccion", label: "Dirección", type: "text", full: true },
      ]}
      buildPayload={(f) => ({
        nombre: f.nombre,
        apellidos: f.apellidos,
        email: f.email,
        rol: f.rol,
        provincia: f.provincia,
        municipio: f.municipio,
        cp: f.cp,
        direccion: f.direccion,
      })}
    />
  );
}

export default UsersManagement;