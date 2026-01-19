import AdminCrudPage from "../components/AdminCrudPage";
import "../AdminManagement.css";

const emptyCancion = {
  id: null,
  lanzamientoId: "",
  titulo: "",
  duracion: "",
  trackNumber: "",
};

function SongsManagement() {
  return (
    <AdminCrudPage
      title="Canciones"
      subtitle="Gestión de tracks."
      entityName="canción"
      listPath="/api/canciones"
      createPath="/api/canciones"
      updatePath={(id) => `/api/canciones/${id}`}
      deletePath={(id) => `/api/canciones/${id}`}
      requireAdmin
      emptyForm={emptyCancion}
      searchKeys={["id", "lanzamientoId", "titulo", "duracion", "duracionFormateada", "trackNumber"]}
      columns={[
        { key: "id", header: "ID", className: "adminMono" },
        { key: "lanzamientoId", header: "Lanzamiento ID", className: "adminMono" },
        { key: "trackNumber", header: "#", className: "adminMono" },
        { key: "titulo", header: "Título" },
        { key: "duracionFormateada", header: "Duración" },
        { key: "duracion", header: "Seg", className: "adminMono" },
      ]}
      columnsGridCss={`
        grid-template-columns:
          70px
          140px
          70px
          1.8fr
          120px
          90px
          170px;
        min-width: 880px;
      `}
      formFields={[
        { name: "lanzamientoId", label: "Lanzamiento ID", type: "number" },
        { name: "trackNumber", label: "Track #", type: "number" },
        { name: "titulo", label: "Título", type: "text", full: true },
        { name: "duracion", label: "Duración (segundos)", type: "number" },
      ]}
      buildPayload={(f) => ({
        lanzamiento_id: f.lanzamientoId === "" ? null : Number(f.lanzamientoId),
        track_number: f.trackNumber === "" ? null : Number(f.trackNumber),
        titulo: f.titulo,
        duracion: f.duracion === "" ? 0 : Number(f.duracion),
      })}
    />
  );
}

export default SongsManagement;