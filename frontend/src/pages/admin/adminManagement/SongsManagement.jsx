import { useEffect, useMemo, useState } from "react";
import AdminCrudPage from "../components/AdminCrudPage";
import "../AdminManagement.css";

const API_URL = "http://localhost:8000";

const emptyCancion = {
  id: null,
  lanzamientoId: "",
  titulo: "",
  duracion: "",
  trackNumber: "",
};

function SongsManagement() {
  const [lanzamientos, setLanzamientos] = useState([]);
  const [loadingLanzamientos, setLoadingLanzamientos] = useState(false);

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
        setLoadingLanzamientos(true);

        const res = await fetch(`${API_URL}/api/lanzamientos`, {
          method: "GET",
          headers: authHeaders,
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.message || "No se pudieron cargar lanzamientos");

        const items = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json)
          ? json
          : [];

        if (!cancelled) setLanzamientos(items);
      } catch (e) {
        console.error(e);
        if (!cancelled) setLanzamientos([]);
      } finally {
        if (!cancelled) setLoadingLanzamientos(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authHeaders]);

  const lanzamientoOptions = useMemo(() => {
    return [
      {
        value: "",
        label: "— Selecciona un lanzamiento —",
        disabled: true,
      },
      ...lanzamientos.map((l) => ({
        value: String(l.id),
        label: l.titulo,
      })),
    ];
  }, [lanzamientos]);

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
      searchKeys={["id", "lanzamiento", "titulo", "duracion", "duracionFormateada", "trackNumber"]}
      columns={[
        { key: "id", header: "ID", className: "adminMono" },
        { key: "lanzamiento", header: "Lanzamiento" },
        { key: "trackNumber", header: "Track", className: "adminMono" },
        { key: "titulo", header: "Título" },
        { key: "duracionFormateada", header: "Duración" },
      ]}
      columnsGridCss={`
        grid-template-columns:
          200px
          70px
          1.8fr
          120px
          170px;
        min-width: 880px;
      `}
      formFields={[
        {
          name: "lanzamientoId",
          label: "Lanzamiento",
          type: "select",
          full: true,
          options: lanzamientoOptions,
          help: loadingLanzamientos ? "Cargando lanzamientos..." : "",
        },
        { name: "trackNumber", label: "Track #", type: "number" },
        { name: "titulo", label: "Título", type: "text", full: true },
        { name: "duracion", label: "Duración (segundos)", type: "number" },
      ]}
      buildPayload={(f) => ({
        lanzamiento_id:
          f.lanzamientoId === "" ? null : Number(f.lanzamientoId),
        track_number:
          f.trackNumber === "" ? null : Number(f.trackNumber),
        titulo: f.titulo,
        duracion:
          f.duracion === "" ? 0 : Number(f.duracion),
      })}
    />
  );
}

export default SongsManagement;
