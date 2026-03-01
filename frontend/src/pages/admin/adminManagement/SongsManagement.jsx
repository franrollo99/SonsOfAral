import AdminCrudPage from "../components/AdminCrudPage";
import "../AdminManagement.css";

const emptyCancion = {
  id: null,
  lanzamiento: "",
  trackNumber: "",
  titulo: "",
  duracion: "",
  duracionFormateada: "",
};

function SongsManagement() {
  return (
    <AdminCrudPage
      title="Canciones"
      entityName="canción"
      listPath="/canciones"
      requireAdmin
      emptyForm={emptyCancion}
      searchKeys={["id", "lanzamiento", "titulo", "duracionFormateada", "trackNumber"]}
      columns={[
        { key: "id", header: "ID", className: "adminMono" },
        { key: "titulo", header: "Título" },
        { key: "duracionFormateada", header: "Duración" },
        { key: "trackNumber", header: "Track", className: "adminMono" },
        { key: "lanzamiento", header: "Lanzamiento" },
      ]}
      columnsGridCss={`
        grid-template-columns:
        1.8fr
          80px
          90px
          2fr
          140px;
        min-width: 980px;
      `}
      editLabel="Detalles"
      hideSave
      formFields={[
        { name: "lanzamiento", label: "Lanzamiento", type: "text", disabled: true, full: true },
        { name: "trackNumber", label: "Track #", type: "text", disabled: true },
        { name: "titulo", label: "Título", type: "text", disabled: true, full: true },
        { name: "duracionFormateada", label: "Duración", type: "text", disabled: true },
      ]}
      buildPayload={() => ({})}
    />
  );
}

export default SongsManagement;