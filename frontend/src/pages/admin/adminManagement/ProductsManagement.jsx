import { useEffect, useMemo, useState } from "react";
import AdminCrudPage from "../components/AdminCrudPage";
import "../AdminManagement.css";

const API_URL = "http://localhost:8000";
const TIPOS_PATH = "/api/tipos-productos";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const money = (v) => {
  const n = typeof v === "number" ? v : Number(v);
  if (Number.isNaN(n)) return "-";
  return n.toFixed(2) + " €";
};
const yesNo = (v) => (String(v) === "1" || v === 1 || v === true ? "Sí" : "No");

const emptyProducto = {
  id: null,
  nombre: "",
  descripcion: "",
  // ✅ ahora array, para que se guarde como JSON
  tallas_disponibles: [],
  precio: "",
  slug: "", // si lo autogeneras en backend, luego lo quitamos del payload
  activo: "1",
  tipo_producto_id: "",
};

function ProductsManagement() {
  const [tipos, setTipos] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(false);

  const token = useMemo(() => localStorage.getItem("token"), []);
  const authHeaders = useMemo(
    () => ({
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoadingTipos(true);

        const res = await fetch(`${API_URL}${TIPOS_PATH}`, {
          method: "GET",
          headers: authHeaders,
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.message || "No se pudieron cargar los tipos de producto");

        const items = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
        if (!cancelled) setTipos(items);
      } catch (e) {
        console.error(e);
        if (!cancelled) setTipos([]);
      } finally {
        if (!cancelled) setLoadingTipos(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authHeaders]);

  const tipoOptions = useMemo(() => {
    return [
      { value: "", label: "— Selecciona un tipo —", disabled: true },
      ...tipos.map((t) => ({
        value: String(t.id),
        label: t.nombre,
      })),
    ];
  }, [tipos]);

  const ropaTipoId = useMemo(() => {
    const ropa = tipos.find(
      (t) => String(t?.nombre || "").toLowerCase() === "ropa"
    );
    return ropa ? String(ropa.id) : null;
  }, [tipos]);

  const isRopaSelected = (form) =>
    ropaTipoId && String(form?.tipo_producto_id) === String(ropaTipoId);


  return (
    <AdminCrudPage
      title="Productos"
      subtitle="Gestión de catálogo."
      entityName="producto"
      listPath="/api/productos"
      createPath="/api/productos"
      updatePath={(id) => `/api/productos/${id}`}
      deletePath={(id) => `/api/productos/${id}`}
      requireAdmin
      emptyForm={emptyProducto}
      searchKeys={["id", "nombre", "descripcion", "tallas_disponibles", "precio", "slug", "activo"]}
      columns={[
        { key: "id", header: "ID", className: "adminMono" },
        { key: "nombre", header: "Nombre" },
        {
          key: "tipo",
          header: "Tipo",
          render: (_, row) => row?.tipo?.nombre ?? "-",
        },
        { key: "precio", header: "Precio", render: (v, row) => row?.precio_formateado ?? money(v) },
        { key: "activo", header: "Activo", render: (v) => yesNo(v) },
        { key: "slug", header: "Slug", className: "adminTruncate", title: (v) => v || "" },

        // ✅ tabla: tallas como texto legible
        {
          key: "tallas_disponibles",
          header: "Tallas",
          className: "adminTruncate",
          render: (v) => (Array.isArray(v) ? v.join(",") : v ? String(v) : "-"),
          title: (v) => (Array.isArray(v) ? v.join(",") : v ? String(v) : ""),
        },

        { key: "descripcion", header: "Descripción", className: "adminTruncate", title: (v) => v || "" },
      ]}
      columnsGridCss={`
        grid-template-columns:
          300px
          130px
          90px
          80px
          220px
          100px
          1.6fr
          170px;
        min-width: 1100px;
      `}
      formFields={[
        { name: "nombre", label: "Nombre", type: "text", full: true },
        {
          name: "tipo_producto_id",
          label: "Tipo",
          type: "select",
          options: tipoOptions,
          help: loadingTipos ? "Cargando tipos..." : "",
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
          name: "tallas_disponibles",
          label: "Tallas disponibles",
          type: "sizes",
          full: true,
          sizes: ALL_SIZES,
          help: "Selecciona las tallas disponibles.",
          showWhen: (form) => isRopaSelected(form),
        },


        { name: "descripcion", label: "Descripción", type: "textarea", full: true, rows: 5 },
      ]}
      buildPayload={(f) => ({
        nombre: f.nombre,
        descripcion: f.descripcion,
        tallas_disponibles: isRopaSelected(f)
          ? (Array.isArray(f.tallas_disponibles) ? f.tallas_disponibles : [])
          : [],
        precio: f.precio === "" ? 0 : Number(f.precio),
        slug: f.slug,
        activo: String(f.activo) === "1" || f.activo === true ? 1 : 0,
        tipo_producto_id: f.tipo_producto_id === "" ? null : Number(f.tipo_producto_id),
      })}
    />
  );
}

export default ProductsManagement;
