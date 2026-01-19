import AdminCrudPage from "../components/AdminCrudPage";
import "../AdminManagement.css";

const date = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString("es-ES");
};

const emptyLanzamiento = {
  id: null,
  tipo: "album",          // ajusta a tu enum real si es distinto
  titulo: "",
  fechaLanzamiento: "",   // tu Resource lo devuelve como fechaLanzamiento
  descripcion: "",
};

function ReleasesManagement() {
  return (
    <AdminCrudPage
      title="Lanzamientos"
      subtitle="Gestión de álbumes/singles."
      entityName="lanzamiento"
      listPath="/api/lanzamientos"
      createPath="/api/lanzamientos"
      updatePath={(id) => `/api/lanzamientos/${id}`}
      deletePath={(id) => `/api/lanzamientos/${id}`}
      requireAdmin
      emptyForm={emptyLanzamiento}
      searchKeys={["id", "tipo", "titulo", "fechaLanzamiento", "descripcion"]}
      columns={[
        { key: "id", header: "ID", className: "adminMono" },
        { key: "tipo", header: "Tipo" },
        { key: "titulo", header: "Título" },
        { key: "fechaLanzamiento", header: "Fecha", render: (v) => date(v) },
        {
          key: "duracionTotalMinutos",
          header: "Duración",
          render: (v) => (typeof v === "number" ? `${v} min` : "-"),
        },
        {
          key: "canciones",
          header: "Canciones",
          render: (v) => (Array.isArray(v) ? v.length : "-"),
        },
        { key: "descripcion", header: "Descripción", className: "adminTruncate", title: (v) => v || "" },
      ]}
      columnsGridCss={`
        grid-template-columns:
          70px
          120px
          1.4fr
          130px
          120px
          120px
          2fr
          170px;
        min-width: 980px;
      `}
      formFields={[
        {
          name: "tipo",
          label: "Tipo",
          type: "select",
          options: [
            { value: "album", label: "album" },
            { value: "single", label: "single" },
            { value: "ep", label: "ep" },
          ],
        },
        { name: "titulo", label: "Título", type: "text", full: true },
        { name: "fechaLanzamiento", label: "Fecha lanzamiento", type: "date" },
        { name: "descripcion", label: "Descripción", type: "textarea", full: true, rows: 6 },
      ]}
      buildPayload={(f) => ({
        tipo: f.tipo,
        titulo: f.titulo,
        fecha_lanzamiento: f.fechaLanzamiento, // ojo: en DB seguramente se llama fecha_lanzamiento
        descripcion: f.descripcion,
      })}
    />
  );
}

export default ReleasesManagement;