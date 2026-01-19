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
  precio_entrada: "",
  entrada_anticipada: 0,
  enlace_entrada_anticipada: "",
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
        { key: "precioEntrada", header: "Precio", className: "text-end", render: (v) => money(v) },
        { key: "entradaAnticipada", header: "Anticipada", render: (v) => yesNo(v) },
        {
          key: "enlaceEntradaAnticipada", header: "Enlace", className: "adminTruncate", title: (v) => v 
        },
      ]}
      columnsGridCss={`
        grid-template-columns:
          70px
          110px
          120px
          140px
          1.1fr
          1.6fr
          110px
          110px
          1fr
          170px;
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
            { value: 0, label: "No" },
            { value: 1, label: "Sí" },
          ],
        },
        {
          name: "enlaceEntradaAnticipada",
          label: "Enlace entrada anticipada",
          type: "text",
          full: true,
          placeholder: "https://...",
          disabled: (form) => !(String(form?.entradaAnticipada) === "1" || form?.entradaAnticipada === 1),
          help: (form) =>
            String(form?.entradaAnticipada) === "1" || form?.entradaAnticipada === 1
              ? ""
              : "Activa “Entrada anticipada” para habilitar el enlace.",
        },
      ]}
      buildPayload={(form) => ({
        fecha: form.fecha,
        provincia: form.provincia,
        municipio: form.municipio,
        lugar: form.lugar,
        descripcion: form.descripcion,
        precio_entrada: form.precio_entrada === "" ? 0 : Number(form.precio_entrada),
        entrada_anticipada: String(form.entrada_anticipada) === "1" || form.entrada_anticipada === 1 ? 1 : 0,
        enlace_entrada_anticipada: form.enlace_entrada_anticipada || null,
      })}
    />
  );
}

export default ConcertsManagement;