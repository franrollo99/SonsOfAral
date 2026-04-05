import { useRef, useState } from "react";
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
  portada: null,
  portadaUrlActual: "",
  portadaNombreActual: "",
  removePortada: false,
  cancionesDraft: [
    {
      _k: "base",
      titulo: "",
      duracionMin: "",
      duracionSeg: "",
      audio: null,
      audioUrlActual: "",
      audioNombreActual: "",
      removeAudio: false,
    },
  ],
};

const toSeconds = (min, sec) => {
  const m = Number(min) || 0;
  let s = Number(sec) || 0;
  if (s < 0) s = 0;
  if (s > 59) s = 59;
  return m * 60 + s;
};

const fromSeconds = (total) => {
  const t = Number(total);
  if (!Number.isFinite(t) || t <= 0) return { duracionMin: "", duracionSeg: "" };
  return { duracionMin: String(Math.floor(t / 60)), duracionSeg: String(t % 60) };
};

function SongAudioField({ song, index, setForm }) {
  const inputRef = useRef(null);

  const selectedFile = song?.audio instanceof File ? song.audio : null;
  const currentUrl = !song?.removeAudio ? song?.audioUrlActual || "" : "";
  const currentName = !song?.removeAudio ? song?.audioNombreActual || "" : "";

  const shownName = selectedFile ? selectedFile.name : currentName;
  const hasVisibleAudio = !!selectedFile || !!currentUrl;

  const updateSong = (updater) => {
    setForm((p) => ({
      ...p,
      cancionesDraft: (p.cancionesDraft || []).map((x, i) =>
        i === index ? { ...x, ...updater(x) } : x
      ),
    }));
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0] || null;

    updateSong(() => ({
      audio: file,
      removeAudio: false,
    }));

    e.target.value = "";
  };

  const removeShownAudio = () => {
    if (selectedFile) {
      updateSong((x) => ({
        audio: null,
        removeAudio: !!x.audioUrlActual,
      }));
      return;
    }

    if (currentUrl) {
      updateSong(() => ({
        audio: null,
        removeAudio: true,
      }));
    }
  };

  const discardNewAudio = () => {
    updateSong(() => ({
      audio: null,
      removeAudio: false,
    }));
  };

  return (
    <div className="adminSongAudioBlock d-flex flex-column gap-2">
      <label className="adminSongLabel">Audio</label>

      <input
        ref={inputRef}
        type="file"
        accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/ogg,audio/mp4,audio/x-m4a,.mp3,.wav,.ogg,.m4a"
        style={{ display: "none" }}
        onChange={onFileChange}
      />

      <div className="d-flex align-items-center gap-3 flex-wrap">
        <button
          type="button"
          className="adminActionBtn text-start px-3"
          onClick={() => inputRef.current?.click()}
        >
          {hasVisibleAudio ? "Cambiar audio" : "Seleccionar audio"}
        </button>

        {shownName ? (
          <span className="adminMuted adminSongFileName">
            Archivo mostrado: {shownName}
          </span>
        ) : null}
      </div>

      {hasVisibleAudio ? (
        <div>
          <audio
            controls
            preload="metadata"
            src={selectedFile ? URL.createObjectURL(selectedFile) : currentUrl}
            style={{ width: "85%" }}
          />
        </div>
      ) : null}

      <div className="d-flex gap-2 flex-wrap">
        {!selectedFile && currentUrl ? (
          <button
            type="button"
            className="adminActionBtn adminActionBtn--danger"
            onClick={removeShownAudio}
          >
            Quitar audio
          </button>
        ) : null}

        {selectedFile && currentUrl ? (
          <button
            type="button"
            className="adminActionBtn"
            onClick={discardNewAudio}
          >
            Descartar audio nuevo
          </button>
        ) : null}

        {selectedFile && !currentUrl ? (
          <button
            type="button"
            className="adminActionBtn adminActionBtn--danger"
            onClick={removeShownAudio}
          >
            Quitar audio
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ReleasesManagement() {
  const [form, setForm] = useState(emptyLanzamiento);

  const handleDurationChange = (setFormFn, index, field, value, max) => {
    if (value === "") {
      setFormFn((p) => ({
        ...p,
        cancionesDraft: (p.cancionesDraft || []).map((x, i) =>
          i === index ? { ...x, [field]: "" } : x
        ),
      }));
      return;
    }

    const clean = String(value).replace(/\D/g, "");
    let n = Number(clean);

    if (!Number.isFinite(n)) n = 0;
    if (n < 0) n = 0;
    if (typeof max === "number" && n > max) n = max;

    setFormFn((p) => ({
      ...p,
      cancionesDraft: (p.cancionesDraft || []).map((x, i) =>
        i === index ? { ...x, [field]: String(n) } : x
      ),
    }));
  };

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
                ...fromSeconds(s.duracion ?? 0),
                audio: null,
                audioUrlActual: s.audio?.url || "",
                audioNombreActual: s.audio?.nombre_original || "",
                removeAudio: false,
              }))
            : base.cancionesDraft && base.cancionesDraft.length
              ? base.cancionesDraft
              : [
                {
                  _k: "base",
                  titulo: "",
                  duracionMin: "",
                  duracionSeg: "",
                  audio: null,
                  audioUrlActual: "",
                  audioNombreActual: "",
                  removeAudio: false,
                },
              ];

        return {
          ...base,
          ...(row || {}),
          portada: null,
          portadaUrlActual: row?.portada?.url || "",
          portadaNombreActual: row?.portada?.nombre_original || "",
          removePortada: false,
          cancionesDraft: draft,
        };
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
        {
          name: "portada",
          label: "Portada",
          type: "file",
          full: true,
          accept: "image/png,image/jpeg,image/webp",
          currentUrlKey: "portadaUrlActual",
          currentNameKey: "portadaNombreActual",
          removeFlagKey: "removePortada",
        },
        { name: "descripcion", label: "Descripción", type: "textarea", full: true, rows: 6 },
        { name: "compraUrl", label: "URL compra", type: "text", full: true },
        { name: "audioUrl", label: "URL audio", type: "text", full: true },
        { name: "videoUrl", label: "URL video", type: "text", full: true },
      ]}
      modalAfterFields={({ form, setForm }) => (
        <div>
          <h4 className="adminSongsTitle">Canciones</h4>

          <div className="d-flex flex-column gap-3">
            {(form.cancionesDraft || []).map((s, i) => (
              <div key={s._k ?? i} className="adminSongItem">
                <div className="adminSongTrack">{i + 1}</div>

                <div className="adminSongContent">
                  <div className="d-flex align-items-end gap-3 flex-wrap">
                    <div className="adminSongField flex-grow-1">
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

                    <div className="adminSongField adminSongDurationField">
                      <label className="adminSongLabel">Duración</label>

                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="number"
                          className="adminInput adminSongTimeInput"
                          value={s.duracionMin ?? ""}
                          onChange={(e) =>
                            handleDurationChange(setForm, i, "duracionMin", e.target.value, 99)
                          }
                        />

                        <span className="adminSongTimeSep">:</span>

                        <input
                          type="number"
                          className="adminInput adminSongTimeInput"
                          value={s.duracionSeg ?? ""}
                          onChange={(e) =>
                            handleDurationChange(setForm, i, "duracionSeg", e.target.value, 59)
                          }
                        />
                      </div>
                    </div>

                    {i > 0 ? (
                      <button
                        className="adminSongBtn btn-red adminSongRemoveBtn"
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
                      <div className="adminSongRemovePlaceholder" />
                    )}
                  </div>

                  <div className="mt-3">
                    <SongAudioField song={s} index={i} setForm={setForm} />
                  </div>
                </div>
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
                    {
                      _k: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
                      titulo: "",
                      duracionMin: "",
                      duracionSeg: "",
                      audio: null,
                      audioUrlActual: "",
                      audioNombreActual: "",
                      removeAudio: false,
                    },
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
        fd.append("remove_portada", f.removePortada ? "1" : "0");

        if (f.portada instanceof File) fd.append("portada", f.portada);

        const cancionesNorm = (f.cancionesDraft || []).map((x, i) => {
          let audioKey = null;

          if (x.audio instanceof File) {
            audioKey = `audio_${i}`;
            fd.append(audioKey, x.audio);
          }

          return {
            id: x.id ?? null,
            titulo: (x.titulo ?? "").trim(),
            duracion: toSeconds(x.duracionMin, x.duracionSeg),
            remove_audio: x.removeAudio ? 1 : 0,
            audio_key: audioKey,
          };
        });

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

        return fd;
      }}
    />
  );
}

export default ReleasesManagement;