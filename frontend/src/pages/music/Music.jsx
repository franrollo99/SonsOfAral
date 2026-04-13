import { useEffect, useMemo, useRef, useState } from "react";
import "./Music.css";

const API_URL = import.meta.env.VITE_API_URL;

const LS_KEY = "lanzamientos";

function readCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (!("ts" in parsed) || !("data" in parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch { }
}

function normalizeOrdered(raw) {
  return [...raw].sort((a, b) => {
    const da = a?.fechaLanzamiento ? new Date(a.fechaLanzamiento) : new Date(0);
    const db = b?.fechaLanzamiento ? new Date(b.fechaLanzamiento) : new Date(0);
    return db - da;
  });
}

function Musica() {
  const [lanzamientos, setLanzamientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [lanzamientoSeleccionado, setLanzamientoSeleccionado] = useState(null);

  const audioRef = useRef(null);
  const [activeTrackId, setActiveTrackId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const compraUrl = (lanzamientoSeleccionado?.compraUrl || "").trim();
  const audioUrl = (lanzamientoSeleccionado?.audioUrl || "").trim();
  const videoUrl = (lanzamientoSeleccionado?.videoUrl || "").trim();

  useEffect(() => {
    const cached = readCache(LS_KEY);

    if (Array.isArray(cached?.data)) {
      setLanzamientos(normalizeOrdered(cached.data));
      setCargando(false);
    }

    const controller = new AbortController();

    const cargarLanzamientos = async () => {
      try {
        setError(null);

        const res = await fetch(`${API_URL}/lanzamientos`, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json().catch(() => ({}));
        const raw = Array.isArray(data?.data) ? data.data : [];
        writeCache(LS_KEY, raw);
        setLanzamientos(normalizeOrdered(raw));
      } catch (e) {
        if (e?.name !== "AbortError") {
          console.error(e);
          if (!Array.isArray(cached?.data)) setError("No se pudieron cargar los discos.");
        }
      } finally {
        setCargando(false);
      }
    };

    cargarLanzamientos();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalOpen]);

  const abrirModal = (lanzamiento) => {
    const canciones = Array.isArray(lanzamiento?.canciones) ? lanzamiento.canciones : [];
    setLanzamientoSeleccionado({ ...lanzamiento, canciones });
    setModalOpen(true);
  };

  const cerrarModal = () => {
    stopAudio();
    setModalOpen(false);
    setLanzamientoSeleccionado(null);
  };

  const lanzamientosFiltrados = useMemo(() => {
    const f = (filtro ?? "all").toLowerCase();
    if (f === "all") return lanzamientos;
    const tipoBuscado = f === "all" ? "all" : f;
    return lanzamientos.filter((l) => (l?.tipo ?? "").toLowerCase() === tipoBuscado);
  }, [lanzamientos, filtro]);

  const formatTime = (secs) => {
    const n = Number(secs) || 0;
    const m = Math.floor(n / 60);
    const s = Math.floor(n % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const stopAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.src.startsWith("blob:")) {
      URL.revokeObjectURL(audio.src);
    }

    audio.pause();
    audio.removeAttribute("src");
    audio.load();

    setIsPlaying(false);
    setActiveTrackId(null);
    setCurrentTime(0);
    setDuration(0);
  };

  const toggleTrack = (track) => {
    const url = `${API_URL}/canciones/${track.id}/audio`;
    const id = track?.id;

    if (!url || !id) return;

    const audio = audioRef.current;
    if (!audio) return;

    if (activeTrackId === id) {
      if (audio.paused) {
        audio.play().then(() => setIsPlaying(true)).catch(() => { });
      } else {
        audio.pause();
        setIsPlaying(false);
      }
      return;
    }

    const cargarYReproducir = async () => {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);

        audio.src = blobUrl;
        audio.load();

        await audio.play();

        setActiveTrackId(id);
        setIsPlaying(true);
      } catch (e) { }
    };

    cargarYReproducir();
  };

  const onSeekTrack = (value) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Number(value) || 0;
    setCurrentTime(audio.currentTime);
  };

  useEffect(() => {
    if (!modalOpen) return;

    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
      setDuration(audio.duration || 0);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setActiveTrackId(null);
      if (audio.duration) setDuration(audio.duration);
    };

    const onPause = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("play", onPlay);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("play", onPlay);
    };
  }, [modalOpen]);

  const filtrosVisibles = useMemo(() => {
    const tipos = new Set();

    for (const lanzamiento of lanzamientos) {
      const tipo = String(lanzamiento?.tipo || "").toLowerCase();
      if (tipo) tipos.add(tipo);
    }

    const items = [{ value: "all", label: "Todos" }];

    if (tipos.has("album")) items.push({ value: "album", label: "Album" });
    if (tipos.has("ep")) items.push({ value: "ep", label: "EP" });
    if (tipos.has("single")) items.push({ value: "single", label: "Single" });

    return items;
  }, [lanzamientos]);

  return (
    <section>
      <div className="d-flex align-items-end justify-content-between gap-3">
        <h1>Explorar lanzamientos</h1>

        <div className="d-flex flex-wrap justify-content-end gap-2">
          {filtrosVisibles.map((item) => (
            <button
              key={item.value}
              className={`filtroMusica ${filtro === item.value ? "isActive" : ""}`}
              onClick={() => setFiltro(item.value)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <hr />

      {cargando && <p>Cargando música...</p>}
      {error && !cargando && <p className="errorMessage">{error}</p>}
      {!cargando && !error && lanzamientosFiltrados.length === 0 && <p>No hay lanzamientos disponibles por ahora.</p>}

      {!cargando && !error && lanzamientosFiltrados.length > 0 && (
        <div className="lanzamientos row g-4">
          {lanzamientosFiltrados.map((lanzamiento) => (
            <div key={lanzamiento.id} className="py-3 col-12 col-sm-6 col-lg-3">
              <article
                className="lanzamiento"
                onClick={() => abrirModal(lanzamiento)}
                role="button"
                tabIndex={0}
              >
                <div className="lanzamientoPortada">
                  <img
                    src={lanzamiento.portada?.url}
                    srcSet={
                      lanzamiento.portada?.urlSm
                        ? `${lanzamiento.portada.urlSm} 500w, ${lanzamiento.portada.url} 1400w`
                        : undefined
                    }
                    sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 25vw"
                    alt={`Portada ${lanzamiento.titulo}`}
                    loading="lazy"
                  />
                </div>

                <div className="lanzamientoDatos">
                  <div className="lanzamientoFecha">
                    {lanzamiento.fechaFormateada} <span className="p-2">•</span> {lanzamiento.tipo}
                  </div>
                  <div className="lanzamientoTitulo">{lanzamiento.titulo}</div>
                </div>
              </article>
            </div>
          ))}
        </div>
      )}

      {modalOpen && lanzamientoSeleccionado && (
        <div className="releaseModalOverlay" onMouseDown={cerrarModal}>
          <div className="releaseModal d-flex flex-column" onMouseDown={(e) => e.stopPropagation()}>
            <button className="modalClose d-flex align-items-center justify-content-center" type="button" aria-label="Cerrar" onClick={cerrarModal}>
              <img src="/images/close.svg" alt="" />
            </button>

            <audio ref={audioRef} preload="auto" style={{ display: "none" }} />

            <div className="modalGrid">
              <aside className="modalLeft d-flex flex-column gap-3">
                <div className="cover">
                  <img
                    src={lanzamientoSeleccionado.portada?.url}
                    alt={`Portada ${lanzamientoSeleccionado.titulo}`}
                  />
                </div>

                <div className="leftMeta d-flex flex-column gap-3">
                  <div className="smallMeta">
                    PISTAS: {(lanzamientoSeleccionado.canciones ?? []).length} <span>|</span> DURACION: {lanzamientoSeleccionado.duracionTotalMinutos} MIN
                  </div>

                  {(compraUrl || audioUrl || videoUrl) && (
                    <div className="buttons d-flex flex-column gap-3 mt-4">
                      {(compraUrl || audioUrl) && (
                        <div className="d-flex gap-3">
                          {compraUrl && (
                            <a href={compraUrl} target="_blank" rel="noreferrer" className="btn btn-outline-light btnWide buyListen">
                              COMPRAR
                            </a>
                          )}

                          {audioUrl && (
                            <a href={audioUrl} target="_blank" rel="noreferrer" className="btn btn-outline-light btnWide buyListen">
                              ESCUCHAR
                            </a>
                          )}
                        </div>
                      )}

                      {videoUrl && (
                        <a href={videoUrl} target="_blank" rel="noreferrer" className="btn btn-danger btnWide">
                          VER
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </aside>

              <main className="modalRight d-flex flex-column gap-3">
                <header className="headerModal">
                  <h2 className="title">{lanzamientoSeleccionado.titulo}</h2>
                  <div className="sub">
                    {lanzamientoSeleccionado.fechaFormateada} · {lanzamientoSeleccionado.tipo}
                  </div>
                </header>

                <div className="rightContent d-flex flex-column gap-3">
                  <p className="releaseDescription">{lanzamientoSeleccionado.descripcion}</p>
                  <hr className="divider" />
                  <div className="tracklist">
                    <ol>
                      {(lanzamientoSeleccionado.canciones ?? []).map((c, idx) => {
                        const hasAudio = !!c?.audio?.url;
                        const isActive = activeTrackId === c?.id;
                        const shownTime = isActive
                          ? `${formatTime(currentTime)} / ${formatTime(duration || c?.duracion || 0)}`
                          : c?.duracion_formateada ?? c?.duracionFormateada ?? "";

                        return (
                          <li
                            key={c.id ?? idx}
                            className={`trackRow ${isActive ? "isActive" : ""}`}
                          >
                            <div className="trackLead">
                              <span className="trackIndex">{idx + 1}</span>
                            </div>

                            <div className="trackMain">
                              <div className="trackTop">
                                <span className="trackName">{c.titulo}</span>
                                <span className="trackTime">{shownTime}</span>
                              </div>

                              {hasAudio && (
                                <div className="trackPlayerRow">
                                  <button
                                    type="button"
                                    className={`trackPlayBtn ${isActive && isPlaying ? "isPlaying" : ""}`}
                                    onClick={() => toggleTrack(c)}
                                    aria-label={isActive && isPlaying ? "Pausar canción" : "Reproducir canción"}
                                  >
                                    {isActive && isPlaying ? "❚❚" : "▶"}
                                  </button>

                                  {isActive ? (
                                    <input
                                      type="range"
                                      min="0"
                                      max={Math.max(duration || c?.duracion || 0, 1)}
                                      step="0.1"
                                      value={Math.min(currentTime, duration || c?.duracion || 0)}
                                      onChange={(e) => onSeekTrack(e.target.value)}
                                      className="trackProgress"
                                    />
                                  ) : (
                                    <div className="trackProgress trackProgressPlaceholder" />
                                  )}
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ol>

                    {(!lanzamientoSeleccionado.canciones || lanzamientoSeleccionado.canciones.length === 0) && (
                      <div className="text-secondary">Sin canciones para mostrar.</div>
                    )}
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Musica;