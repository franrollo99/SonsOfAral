import AdminCrudPage from "../components/AdminCrudPage";
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
};

function ConcertsManagement() {
  return (
    <AdminCrudPage
      title="Conciertos"
      subtitle="Lectura + edición por modal (crear/editar)."
      entityName="concierto"
      listPath="/api/conciertos"
      createPath="/api/conciertos"
      updatePath={(id) => `/api/conciertos/${id}`}
      deletePath={(id) => `/api/conciertos/${id}`}
      requireAdmin={true}
      emptyForm={emptyConcert}
      searchKeys={[
        "id",
        "fecha",
        "provincia",
        "municipio",
        "lugar",
        "descripcion",
        "precioEntrada",
        "entradaAnticipada",
        "enlaceEntradaAnticipada",
      ]}
      columns={[
        { key: "id", header: "ID", className: "adminMono" },
        { key: "fecha", header: "Fecha", render: (v) => date(v) },
        { key: "provincia", header: "Provincia" },
        { key: "municipio", header: "Municipio" },
        { key: "lugar", header: "Lugar", className: "adminTruncate", title: (v) => v || "" },
        { key: "descripcion", header: "Descripción", className: "adminTruncate", title: (v) => v || "" },
        { key: "precioEntrada", header: "Precio", render: (v) => money(v) },
        { key: "entradaAnticipada", header: "Anticipada", render: (v) => yesNo(v) },
        {
          key: "enlaceEntradaAnticipada", header: "Enlace", className: "adminTruncate", title: (v) => v
        },
      ]}
      columnsGridCss={`
        grid-template-columns:
          100px
          110px
          110px
          1.1fr
          1.6fr
          80px
          80px
          1fr
          150px;
        min-width: 1050px;
      `}
      formFields={[
        { name: "fecha", label: "Fecha", type: "date" },
        { name: "precioEntrada", label: "Precio entrada (€)", type: "number", step: "0.01" },
        { name: "provincia", label: "Provincia", type: "text" },
        { name: "municipio", label: "Municipio", type: "text" },
        { name: "lugar", label: "Lugar", type: "text", full: true },
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
      buildPayload={(form) => {
        const anticipada = String(form.entradaAnticipada) === "true";
        return {
          fecha: form.fecha,
          provincia: form.provincia,
          municipio: form.municipio,
          lugar: form.lugar,
          descripcion: form.descripcion,
          precio_entrada: form.precioEntrada === "" ? 0 : Number(form.precioEntrada),
          entrada_anticipada: anticipada ? 1 : 0,
          enlace_entrada_anticipada: anticipada ? (form.enlaceEntradaAnticipada || null) : null,
        };
      }}

    />
  );
}

export default ConcertsManagement;