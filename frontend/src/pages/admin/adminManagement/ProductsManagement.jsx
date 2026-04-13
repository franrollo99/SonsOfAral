import { useMemo } from "react";
import { compressImageIfNeeded } from "../../../utils/compressImage";
import AdminCrudPage from "../components/AdminCrudPage";
import "../AdminManagement.css";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const TIPO_OPTIONS = [
  { value: "", label: "— Selecciona un tipo —", disabled: true },
  { value: "ropa", label: "Ropa" },
  { value: "disco", label: "Disco" },
  { value: "accesorio", label: "Accesorio" },
];

const money = (v) => {
  const n = typeof v === "number" ? v : Number(v);
  if (Number.isNaN(n)) return "-";
  return n.toFixed(2) + " €";
};

const yesNo = (v) => (String(v) === "1" || v === 1 || v === true ? "Sí" : "No");

const formatTipo = (tipo) => {
  if (tipo === "ropa") return "Ropa";
  if (tipo === "disco") return "Disco";
  if (tipo === "accesorio") return "Accesorio";
  return tipo || "-";
};

const emptyProducto = {
  id: null,
  nombre: "",
  descripcion: "",
  tallas_disponibles: [],
  precio: "",
  slug: "",
  activo: "1",
  tipo_producto: "",
  tiene_talla: 0,
  imagen: null,
  imagenUrlActual: "",
  imagenNombreActual: "",
  removeImagen: false,
};

function ProductsManagement() {
  const token = useMemo(() => localStorage.getItem("token"), []);
  const authHeaders = useMemo(
    () => ({
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const hasSizes = (form) =>
    String(form?.tiene_talla) === "1" || form?.tiene_talla === 1 || form?.tiene_talla === true;

  return (
    <AdminCrudPage
      title="Productos"
      entityName="producto"
      listPath="/productos"
      createPath="/productos"
      updatePath={(id) => `/productos/${id}`}
      deletePath={(id) => `/productos/${id}`}
      requireAdmin
      emptyForm={emptyProducto}
      searchKeys={[
        "id",
        "nombre",
        "tipo_producto",
        "tallas_disponibles",
        "precio",
        "slug",
        "activo",
        "tiene_talla",
      ]}
      columns={[
        { key: "id", header: "ID", className: "adminMono" },
        { key: "nombre", header: "Nombre" },
        {
          key: "tipo_producto",
          header: "Tipo",
          render: (v) => formatTipo(v),
        },
        {
          key: "precio",
          header: "Precio",
          render: (v, row) => row?.precio_formateado ?? money(v),
        },
        { key: "activo", header: "Activo", render: (v) => yesNo(v) },
        {
          key: "tallas_disponibles",
          header: "Tallas",
          className: "adminTruncate",
          render: (v, row) =>
            row?.tiene_talla
              ? Array.isArray(v) && v.length > 0
                ? v.join(", ")
                : "-"
              : "-",
          title: (v, row) =>
            row?.tiene_talla && Array.isArray(v) ? v.join(", ") : "",
        },
      ]}
      columnsGridCss={`
        grid-template-columns:
          1fr
          130px
          110px
          100px
          150px
          120px
      `}
      formFields={[
        { name: "nombre", label: "Nombre", type: "text", full: true },
        {
          name: "tipo_producto",
          label: "Tipo",
          type: "select",
          options: TIPO_OPTIONS,
        },
        {
          name: "tiene_talla",
          label: "Tiene talla",
          type: "checkbox",
        },
        { name: "precio", label: "Precio (€)", type: "number", step: "0.01" },
        {
          name: "activo",
          label: "Activo",
          type: "select",
          options: [
            { value: "1", label: "Sí" },
            { value: "0", label: "No" },
          ],
        },
        {
          name: "imagen",
          label: "Imagen (portada)",
          type: "file",
          full: true,
          accept: "image/png,image/jpeg,image/webp",
          currentUrlKey: "imagenUrlActual",
          currentNameKey: "imagenNombreActual",
          removeFlagKey: "removeImagen",
        },
        {
          name: "tallas_disponibles",
          label: "Tallas disponibles",
          type: "sizes",
          full: true,
          sizes: ALL_SIZES,
          showWhen: (form) => hasSizes(form),
        },
        { name: "descripcion", label: "Descripción", type: "textarea", full: true, rows: 5 },
      ]}
      mapRowToForm={(base, row) => ({
        ...base,
        ...(row || {}),
        tiene_talla:
          row?.tiene_talla === true || row?.tiene_talla === 1 || String(row?.tiene_talla) === "1" ? 1 : 0,
        activo: String(row?.activo) === "0" ? "0" : "1",
        tallas_disponibles: Array.isArray(row?.tallas_disponibles) ? row.tallas_disponibles : [],
        imagen: null,
        imagenUrlActual: row?.imagen?.url || "",
        imagenNombreActual: row?.imagen?.nombre_original || "",
        removeImagen: false,
      })}
      buildPayload={async (f) => {
        const fd = new FormData();

        fd.append("nombre", f.nombre || "");
        fd.append("descripcion", f.descripcion || "");
        fd.append("precio", f.precio === "" ? "0" : String(Number(f.precio)));
        fd.append("slug", f.slug || "");
        fd.append("activo", String(f.activo) === "1" || f.activo === true ? "1" : "0");
        fd.append("tipo_producto", f.tipo_producto || "");
        fd.append("remove_imagen", f.removeImagen ? "1" : "0");

        if (f.imagen instanceof File) {
          const compressed = await compressImageIfNeeded(f.imagen);
          fd.append("imagen", compressed);
        }

        fd.append(
          "tiene_talla",
          String(f.tiene_talla) === "1" || f.tiene_talla === 1 || f.tiene_talla === true ? "1" : "0"
        );

        const tallas =
          String(f.tiene_talla) === "1" || f.tiene_talla === 1 || f.tiene_talla === true
            ? Array.isArray(f.tallas_disponibles)
              ? f.tallas_disponibles
              : []
            : [];

        tallas.forEach((t) => fd.append("tallas_disponibles[]", t));

        return fd;
      }}
      requestHeaders={authHeaders}
    />
  );
}

export default ProductsManagement;