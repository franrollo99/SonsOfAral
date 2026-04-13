import AdminCrudPage from "../components/AdminCrudPage";
import { compressImageIfNeeded } from "../../../utils/compressImage";
import "../AdminManagement.css";

const money = (v) => {
  const n = typeof v === "number" ? v : Number(v);
  if (Number.isNaN(n)) return "-";
  return n.toFixed(2) + " €";
};

const date = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString("es-ES", { year: "numeric", month: "2-digit", day: "2-digit" });
};

const yesNo = (v) => (String(v) === "1" || v === 1 || v === true ? "Sí" : "No");

const emptyConcert = {
  id: null,
  fecha: "",
  provincia: "",
  municipio: "",
  lugar: "",
  descripcion: "",
  precioEntrada: "",
  entradaAnticipada: "0",
  enlaceEntradaAnticipada: "",
  cartel: null,
  cartelUrlActual: "",
  cartelNombreActual: "",
  removeCartel: false,
};

function ConcertsManagement() {
  return (
    <AdminCrudPage
      title="Conciertos"
      entityName="concierto"
      listPath="/conciertos?sort=latest&all=1"
      createPath="/conciertos"
      updatePath={(id) => `/conciertos/${id}`}
      deletePath={(id) => `/conciertos/${id}`}
      requireAdmin={true}
      emptyForm={emptyConcert}
      mapRowToForm={(base, row) => ({
        ...base,
        ...(row || {}),
        cartel: null,
        cartelUrlActual: row?.cartel?.url || "",
        cartelNombreActual: row?.cartel?.nombre_original || "",
        removeCartel: false,
      })}
      searchKeys={[
        "id",
        "fecha",
        "provincia",
        "municipio",
        "lugar",
        "precioEntrada",
        "entradaAnticipada",
        "enlaceEntradaAnticipada",
      ]}
      columns={[
        { key: "id", header: "ID", className: "adminMono" },
        { key: "fecha", header: "Fecha", render: (v) => date(v) },
        { key: "lugar", header: "Lugar", className: "adminTruncate", title: (v) => v || "" },
        { key: "provincia", header: "Provincia" },
        { key: "municipio", header: "Municipio" },
        { key: "precioEntrada", header: "Precio", render: (v) => money(v) },
        { key: "entradaAnticipada", header: "Anticipada", render: (v) => yesNo(v) },
      ]}
      columnsGridCss={`
        grid-template-columns:
          100px
          2fr
          1fr
          1fr
          100px
          100px
          150px;
        min-width: 1050px;
      `}
      formFields={[
        { name: "fecha", label: "Fecha", type: "date" },
        { name: "precioEntrada", label: "Precio entrada (€)", type: "number", step: "0.01" },
        { name: "provincia", label: "Provincia", type: "text" },
        { name: "municipio", label: "Municipio", type: "text" },
        { name: "lugar", label: "Lugar", type: "text", full: true },
        {
          name: "cartel",
          label: "Cartel",
          type: "file",
          full: true,
          accept: "image/png,image/jpeg,image/webp",
          currentUrlKey: "cartelUrlActual",
          currentNameKey: "cartelNombreActual",
          removeFlagKey: "removeCartel",
        },
        { name: "descripcion", label: "Descripción", type: "textarea", full: true },
        {
          name: "entradaAnticipada",
          label: "Entrada anticipada",
          type: "select",
          full: true,
          options: [
            { value: false, label: "No" },
            { value: true, label: "Sí" },
          ],
        },
        {
          name: "enlaceEntradaAnticipada",
          label: "Enlace entrada anticipada",
          type: "text",
          full: true,
          disabled: (form) => String(form?.entradaAnticipada) !== "true",
          help: (form) =>
            String(form?.entradaAnticipada) === "true"
              ? ""
              : "Activa “Entrada anticipada” para habilitar el enlace.",
        }
      ]}
      buildPayload={async (form) => {
        const anticipada = String(form.entradaAnticipada) === "true";

        const fd = new FormData();
        fd.append("fecha", form.fecha || "");
        fd.append("provincia", form.provincia || "");
        fd.append("municipio", form.municipio || "");
        fd.append("lugar", form.lugar || "");
        fd.append("descripcion", form.descripcion || "");
        fd.append("precio_entrada", form.precioEntrada === "" ? "0" : String(Number(form.precioEntrada)));
        fd.append("entrada_anticipada", anticipada ? "1" : "0");
        fd.append("enlace_entrada_anticipada", anticipada ? (form.enlaceEntradaAnticipada || "") : "");
        fd.append("remove_cartel", form.removeCartel ? "1" : "0");

        if (form.cartel instanceof File) {
          const compressed = await compressImageIfNeeded(form.cartel);
          fd.append("cartel", compressed);
        }

        return fd;
      }}
    />
  );
}

export default ConcertsManagement;