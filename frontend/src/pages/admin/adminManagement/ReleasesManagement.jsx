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
  tipo: "album",
  titulo: "",
  fechaLanzamiento: "",
  descripcion: "",
  compraUrl: "",
  audioUrl: "",
  videoUrl: "",
  imagen: null,
};

function ReleasesManagement() {
  return (
    <AdminCrudPage
      title="Lanzamientos"
      subtitle="Gestión de álbumes/singles."
      entityName="lanzamiento"
      listPath="/lanzamientos"
      createPath="/lanzamientos"
      updatePath={(id) => `/lanzamientos/${id}`}
      deletePath={(id) => `/lanzamientos/${id}`}
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
          80px
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
          ],
        },
        { name: "titulo", label: "Título", type: "text", full: true },
        { name: "fechaLanzamiento", label: "Fecha lanzamiento", type: "date" },
        {
          name: "imagen",
          label: "Imagen (portada)",
          type: "file",
          full: true,
          accept: "image/png,image/jpeg,image/webp",
        },
        { name: "descripcion", label: "Descripción", type: "textarea", full: true, rows: 6 },
        { name: "compraUrl", label: "URL compra", type: "text", full: true },
        { name: "audioUrl", label: "URL audio", type: "text", full: true },
        { name: "videoUrl", label: "URL video", type: "text", full: true },
      ]}
      buildPayload={(f) => {
        const fd = new FormData();
        fd.append("tipo", f.tipo);
        fd.append("titulo", f.titulo);
        fd.append("fecha_lanzamiento", f.fechaLanzamiento || "");
        fd.append("descripcion", f.descripcion || "");
        fd.append("compra_url", f.compraUrl || "");
        fd.append("audio_url", f.audioUrl || "");
        fd.append("video_url", f.videoUrl || "");

        if (f.imagen instanceof File) {
          fd.append("imagen", f.imagen);
        }

        return fd;
      }}
    />
  );
}

export default ReleasesManagement;