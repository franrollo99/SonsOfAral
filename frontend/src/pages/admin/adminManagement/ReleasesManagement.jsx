import FieldError from "../../../components/FieldError";
import { useId, useRef } from "react";
import { apiUrl } from "../../../lib/api";
import { compressImageIfNeeded } from "../../../utils/compressImage";
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
  if (!Number.isFinite(t) || t <= 0)
    return { duracionMin: "", duracionSeg: "" };
  return {
    duracionMin: String(Math.floor(t / 60)),
    duracionSeg: String(t % 60),
  };
};

function SongAudioField({ song, index, setForm, playingAudioRef, error }) {
  const audioId = useId();
  const inputRef = useRef(null);
  const audioRef = useRef(null);

  const selectedFile = song?.audio instanceof File ? song.audio : null;
  const currentUrl = !song?.removeAudio ? song?.audioUrlActual || "" : "";
  const currentName = !song?.removeAudio ? song?.audioNombreActual || "" : "";

  const shownName = selectedFile ? selectedFile.name : currentName;
  const hasVisibleAudio = !!selectedFile || !!currentUrl;

  const updateSong = (updater) => {
    setForm((p) => ({
      ...p,
      cancionesDraft: (p.cancionesDraft || []).map((x, i) =>
        i === index ? { ...x, ...updater(x) } : x,
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
    if (audioRef.current && playingAudioRef.current === audioRef.current) {
      audioRef.current.pause();
      playingAudioRef.current = null;
    }

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
    if (audioRef.current && playingAudioRef.current === audioRef.current) {
      audioRef.current.pause();
      playingAudioRef.current = null;
    }

    updateSong(() => ({
      audio: null,
      removeAudio: false,
    }));
  };

  const handlePlay = () => {
    if (
      playingAudioRef.current &&
      playingAudioRef.current !== audioRef.current
    ) {
      playingAudioRef.current.pause();
    }

    playingAudioRef.current = audioRef.current;
  };

  const handlePauseOrEnd = () => {
    if (playingAudioRef.current === audioRef.current) {
      playingAudioRef.current = null;
    }
  };

  return (
    <div className="adminSongAudioBlock d-flex flex-column gap-2">
      <label className="adminSongLabel" htmlFor={audioId}>
        Audio de canción {index + 1}
      </label>

      <input
        aria-label={`Archivo de audio de canción ${index + 1}`}
        ref={inputRef}
        type="file"
        accept="audio/mpeg,.mp3"
        style={{ display: "none" }}
        onChange={onFileChange}
      />

      <div className="d-flex align-items-center gap-3 flex-wrap">
        <button
          type="button"
          id={audioId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${audioId}-error` : undefined}
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

      <FieldError id={`${audioId}-error`} error={error} />
      {hasVisibleAudio ? (
        <div>
          <audio
            ref={audioRef}
            controls
            preload="metadata"
            src={selectedFile ? URL.createObjectURL(selectedFile) : currentUrl}
            style={{ width: "85%" }}
            onPlay={handlePlay}
            onPause={handlePauseOrEnd}
            onEnded={handlePauseOrEnd}
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
  const playingAudioRef = useRef(null);

  const handleDurationChange = (setFormFn, index, field, value, max) => {
    if (value === "") {
      setFormFn((p) => ({
        ...p,
        cancionesDraft: (p.cancionesDraft || []).map((x, i) =>
          i === index ? { ...x, [field]: "" } : x,
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
        i === index ? { ...x, [field]: String(n) } : x,
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
                  _k: String(
                    s.id ??
                      crypto?.randomUUID?.() ??
                      Date.now() + Math.random(),
                  ),
                  titulo: s.titulo ?? "",
                  ...fromSeconds(s.duracion ?? 0),
                  audio: null,
                  audioUrlActual: s?.audio?.id
                    ? apiUrl(`/canciones/${s.id}/audio`)
                    : "",
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
        {
          key: "descripcion",
          header: "Descripción",
          className: "adminTruncate",
          title: (v) => v || "",
        },
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
            { value: "EP", label: "EP" },
            { value: "single", label: "single" },
          ],
        },
        { name: "titulo", label: "Título", type: "text", full: true },
        {
          name: "fechaLanzamiento",
          errorName: "fecha_lanzamiento",
          label: "Fecha lanzamiento",
          type: "date",
        },
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
        {
          name: "descripcion",
          label: "Descripción",
          type: "textarea",
          full: true,
          rows: 6,
        },
        {
          name: "compraUrl",
          errorName: "compra_url",
          label: "URL compra",
          type: "text",
          full: true,
        },
        {
          name: "audioUrl",
          errorName: "audio_url",
          label: "URL audio",
          type: "text",
          full: true,
        },
        {
          name: "videoUrl",
          errorName: "video_url",
          label: "URL video",
          type: "text",
          full: true,
        },
      ]}
      modalAfterFields={({ form, setForm, fieldErrors }) => (
        <div>
          <h4 className="adminSongsTitle">Canciones</h4>

          <div className="d-flex flex-column gap-3">
            {(form.cancionesDraft || []).map((s, i) => (
              <div key={s._k ?? i} className="adminSongItem">
                <div className="adminSongTrack">{i + 1}</div>

                <div className="adminSongContent">
                  <div className="d-flex align-items-end gap-3 flex-wrap">
                    <div className="adminSongField flex-grow-1">
                      <label
                        className="adminSongLabel"
                        htmlFor={`song-${s._k}-title`}
                      >
                        Nombre de canción {i + 1}
                      </label>
                      <input
                        className="adminInput"
                        type="text"
                        id={`song-${s._k}-title`}
                        aria-invalid={
                          fieldErrors[`canciones.${i}.titulo`]
                            ? true
                            : undefined
                        }
                        aria-describedby={
                          fieldErrors[`canciones.${i}.titulo`]
                            ? `song-${s._k}-title-error`
                            : undefined
                        }
                        value={s.titulo ?? ""}
                        onChange={(e) => {
                          const titulo = e.target.value;
                          setForm((p) => ({
                            ...p,
                            cancionesDraft: (p.cancionesDraft || []).map(
                              (x, idx) => (idx === i ? { ...x, titulo } : x),
                            ),
                          }));
                        }}
                      />
                      <FieldError
                        id={`song-${s._k}-title-error`}
                        error={fieldErrors[`canciones.${i}.titulo`]}
                      />
                    </div>

                    <div className="adminSongField adminSongDurationField">
                      <label
                        className="adminSongLabel"
                        htmlFor={`song-${s._k}-minutes`}
                      >
                        Duración
                      </label>

                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="number"
                          className="adminInput adminSongTimeInput"
                          id={`song-${s._k}-minutes`}
                          aria-label={`Minutos de canción ${i + 1}`}
                          aria-invalid={
                            fieldErrors[`canciones.${i}.duracion`]
                              ? true
                              : undefined
                          }
                          aria-describedby={
                            fieldErrors[`canciones.${i}.duracion`]
                              ? `song-${s._k}-duration-error`
                              : undefined
                          }
                          min={0}
                          max={99}
                          value={s.duracionMin ?? ""}
                          onChange={(e) =>
                            handleDurationChange(
                              setForm,
                              i,
                              "duracionMin",
                              e.target.value,
                              99,
                            )
                          }
                        />

                        <span className="adminSongTimeSep">:</span>

                        <input
                          type="number"
                          className="adminInput adminSongTimeInput"
                          id={`song-${s._k}-seconds`}
                          aria-label={`Segundos de canción ${i + 1}`}
                          aria-invalid={
                            fieldErrors[`canciones.${i}.duracion`]
                              ? true
                              : undefined
                          }
                          aria-describedby={
                            fieldErrors[`canciones.${i}.duracion`]
                              ? `song-${s._k}-duration-error`
                              : undefined
                          }
                          min={0}
                          max={59}
                          value={s.duracionSeg ?? ""}
                          onChange={(e) =>
                            handleDurationChange(
                              setForm,
                              i,
                              "duracionSeg",
                              e.target.value,
                              59,
                            )
                          }
                        />
                      </div>
                    </div>

                    <FieldError
                      id={`song-${s._k}-duration-error`}
                      error={fieldErrors[`canciones.${i}.duracion`]}
                    />
                    {i > 0 ? (
                      <button
                        aria-label={`Quitar canción ${i + 1}: ${s.titulo || "sin nombre"}`}
                        className="adminSongBtn btn-red adminSongRemoveBtn"
                        type="button"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            cancionesDraft: (p.cancionesDraft || []).filter(
                              (_, idx) => idx !== i,
                            ),
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
                    <SongAudioField
                      song={s}
                      index={i}
                      setForm={setForm}
                      playingAudioRef={playingAudioRef}
                      error={
                        fieldErrors[`audio_${i}`] ||
                        fieldErrors[`canciones.${i}.audio`]
                      }
                    />
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
                      _k: crypto?.randomUUID
                        ? crypto.randomUUID()
                        : String(Date.now() + Math.random()),
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
      buildPayload={async (f) => {
        const fd = new FormData();
        fd.append("tipo", f.tipo);
        fd.append("titulo", f.titulo);
        fd.append("fecha_lanzamiento", f.fechaLanzamiento || "");
        fd.append("descripcion", f.descripcion || "");
        fd.append("compra_url", f.compraUrl || "");
        fd.append("audio_url", f.audioUrl || "");
        fd.append("video_url", f.videoUrl || "");
        fd.append("remove_portada", f.removePortada ? "1" : "0");

        if (f.portada instanceof File) {
          const compressed = await compressImageIfNeeded(f.portada);
          fd.append("portada", compressed);
        }

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

        const primeraOk =
          cancionesNorm[0] &&
          cancionesNorm[0].titulo &&
          cancionesNorm[0].duracion;
        if (!primeraOk) {
          const errors = {};
          if (!cancionesNorm[0]?.titulo) {
            errors["canciones.0.titulo"] = [
              "El nombre de la canción es obligatorio.",
            ];
          }
          if (!cancionesNorm[0]?.duracion) {
            errors["canciones.0.duracion"] = [
              "La duración debe ser mayor que cero.",
            ];
          }
          const failure = new Error(
            "Debes añadir al menos 1 canción (nombre y duración).",
          );
          failure.data = { errors };
          throw failure;
        }

        fd.append(
          "canciones",
          JSON.stringify(
            cancionesNorm
              .filter((x) => x.titulo && x.duracion)
              .map((x, i) => ({ ...x, track: i + 1 })),
          ),
        );

        return fd;
      }}
    />
  );
}

export default ReleasesManagement;
