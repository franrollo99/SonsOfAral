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
  cancionesDraft: [{ _k: "base", titulo: "", duracion: "" }],

};

function ReleasesManagement() {
  return (
    <AdminCrudPage
      title="Lanzamientos"
      entityName="lanzamiento"
      listPath="/lanzamientos"
      createPath="/lanzamientos"
      updatePath={(id) => `/lanzamientos/${id}`}
      deletePath={(id) => `/lanzamientos/${id}`}
      requireAdmin
      emptyForm={emptyLanzamiento}
      searchKeys={["id", "tipo", "titulo", "fechaLanzamiento", "descripcion"]}
      mapRowToForm={(base, row) => {
        const list = Array.isArray(row?.canciones) ? row.canciones : [];
        const draft =
          list.length > 0
            ? list
              .slice()
              .sort((a, b) => (a.track ?? 0) - (b.track ?? 0))
              .map((s) => ({
                id: s.id ?? null,
                _k: String(s.id ?? crypto?.randomUUID?.() ?? Date.now() + Math.random()),
                titulo: s.titulo ?? "",
                duracion: s.duracion ?? "",
              }))
            : base.cancionesDraft && base.cancionesDraft.length
              ? base.cancionesDraft
              : [{ _k: "base", titulo: "", duracion: "" }];

        return { ...base, cancionesDraft: draft };
      }}
      columns={[
        { key: "id", header: "ID", className: "adminMono" },
        { key: "tipo", header: "Tipo" },
        { key: "titulo", header: "Título" },
        { key: "fechaLanzamiento", header: "Fecha", render: (v) => date(v) },
        { key: "duracionTotalMinutos", header: "Duración", render: (v) => (typeof v === "number" ? `${v} min` : "-") },
        { key: "canciones", header: "Canciones", render: (v) => (Array.isArray(v) ? v.length : "-") },
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
        { name: "imagen", label: "Imagen (portada)", type: "file", full: true, accept: "image/png,image/jpeg,image/webp" },
        { name: "descripcion", label: "Descripción", type: "textarea", full: true, rows: 6 },
        { name: "compraUrl", label: "URL compra", type: "text", full: true },
        { name: "audioUrl", label: "URL audio", type: "text", full: true },
        { name: "videoUrl", label: "URL video", type: "text", full: true },
      ]}
      modalAfterFields={({ form, setForm }) => (
        <div>
          <h4 className="adminSongsTitle">Canciones</h4>

          <div className="d-flex flex-column gap-2">
            {(form.cancionesDraft || []).map((s, i) => (
              <div key={s._k ?? i} className="adminSongRow">
                <div className="adminSongTrack">{i + 1}</div>

                <div className="adminSongField">
                  <label className="adminSongLabel">Nombre</label>
                  <input
                    className="adminInput"
                    type="text"
                    value={s.titulo ?? ""}
                    onChange={(e) => {
                      const titulo = e.target.value;
                      setForm((p) => ({
                        ...p,
                        cancionesDraft: (p.cancionesDraft || []).map((x, idx) =>
                          idx === i ? { ...x, titulo } : x
                        ),
                      }));
                    }}
                  />
                </div>

                <div className="adminSongField">
                  <label className="adminSongLabel">Duración (segundos)</label>
                  <input
                    className="adminInput"
                    type="number"
                    min="0"
                    value={s.duracion ?? ""}
                    onChange={(e) => {
                      const duracion = e.target.value;
                      setForm((p) => ({
                        ...p,
                        cancionesDraft: (p.cancionesDraft || []).map((x, idx) =>
                          idx === i ? { ...x, duracion } : x
                        ),
                      }));
                    }}
                  />
                </div>

                {i > 0 ? (
                  <button
                    className="adminSongBtn"
                    type="button"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        cancionesDraft: (p.cancionesDraft || []).filter((_, idx) => idx !== i),
                      }))
                    }
                  >
                    Quitar
                  </button>
                ) : (
                  <span />
                )}
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-center mt-3">
            <button
              className="adminSongBtn"
              type="button"
              onClick={() =>
                setForm((p) => ({
                  ...p,
                  cancionesDraft: [
                    ...(p.cancionesDraft || []),
                    { _k: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()), titulo: "", duracion: "" },
                  ],
                }))
              }
            >
              Añadir canción
            </button>
          </div>
        </div>
      )}

      buildPayload={(f) => {
        const fd = new FormData();
        fd.append("tipo", f.tipo);
        fd.append("titulo", f.titulo);
        fd.append("fecha_lanzamiento", f.fechaLanzamiento || "");
        fd.append("descripcion", f.descripcion || "");
        fd.append("compra_url", f.compraUrl || "");
        fd.append("audio_url", f.audioUrl || "");
        fd.append("video_url", f.videoUrl || "");

        const cancionesNorm = (f.cancionesDraft || []).map((x) => ({
          id: x.id ?? null,
          titulo: (x.titulo ?? "").trim(),
          duracion: Number(x.duracion ?? 0),
        }));

        const primeraOk = cancionesNorm[0] && cancionesNorm[0].titulo && cancionesNorm[0].duracion;
        if (!primeraOk) throw new Error("Debes añadir al menos 1 canción (nombre y duración).");

        fd.append(
          "canciones",
          JSON.stringify(
            cancionesNorm
              .filter((x) => x.titulo && x.duracion)
              .map((x, i) => ({ ...x, track: i + 1 }))
          )
        );

        if (f.imagen instanceof File) fd.append("imagen", f.imagen);
        return fd;
      }}
    />
  );
}

export default ReleasesManagement;