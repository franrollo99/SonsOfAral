import { useEffect, useMemo, useState } from "react";
import "./Music.css";

const API_URL = import.meta.env.VITE_API_URL;

function Musica() {
  const [lanzamientos, setLanzamientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [detalleCargando, setDetalleCargando] = useState(false);
  const [detalleError, setDetalleError] = useState(null);
  const [lanzamientoSeleccionado, setLanzamientoSeleccionado] = useState(null);

  const compraUrl = (lanzamientoSeleccionado?.compraUrl || "").trim();
  const audioUrl = (lanzamientoSeleccionado?.audioUrl || "").trim();
  const videoUrl = (lanzamientoSeleccionado?.videoUrl || "").trim();

  useEffect(() => {
    async function cargarLanzamientos() {
      try {
        setCargando(true);
        setError(null);

        const res = await fetch(`${API_URL}/lanzamientos`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Error al cargar lanzamientos");

        const data = await res.json().catch(() => ({}));
        const raw = Array.isArray(data?.data) ? data.data : [];

        const ordered = [...raw].sort((a, b) => {
          const da = a?.fechaLanzamiento ? new Date(a.fechaLanzamiento) : new Date(0);
          const db = b?.fechaLanzamiento ? new Date(b.fechaLanzamiento) : new Date(0);
          return db - da;
        });

        setLanzamientos(ordered);
      } catch (e) {
        setError("No se pudieron cargar los discos.");
      } finally {
        setCargando(false);
      }
    }

    cargarLanzamientos();
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalOpen]);

  const lanzarFetchDetalleYAbrir = async (lanzamiento) => {
    try {
      setDetalleCargando(true);
      setDetalleError(null);

      const res = await fetch(`${API_URL}/lanzamientos/${lanzamiento.id}`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Error al cargar detalle");

      const data = await res.json().catch(() => ({}));
      const detalle = data?.data ?? data;
      const canciones = Array.isArray(detalle?.canciones) ? detalle.canciones : [];

      setLanzamientoSeleccionado({ ...detalle, canciones });
      setModalOpen(true);
    } catch (e) {
      setDetalleError("No se pudo cargar el lanzamiento.");
    } finally {
      setDetalleCargando(false);
    }
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setLanzamientoSeleccionado(null);
    setDetalleError(null);
  };

  const lanzamientosFiltrados = useMemo(() => {
    const f = (filtro ?? "all").toLowerCase();
    if (f === "all") return lanzamientos;
    const tipoBuscado = f === "albums" ? "album" : f === "singles" ? "single" : f;
    return lanzamientos.filter((l) => (l?.tipo ?? "").toLowerCase() === tipoBuscado);
  }, [lanzamientos, filtro]);

  return (
    <section>
      <div className="d-flex align-items-end justify-content-between gap-3">
        <h1>Explorar lanzamientos</h1>

        <div className="d-flex flex-wrap justify-content-end gap-2">
          <button className={`filtroMusica ${filtro == "all" ? "isActive" : ""}`} onClick={() => setFiltro("all")} type="button">
            Todos
          </button>
          <button className={`filtroMusica ${filtro == "albums" ? "isActive" : ""}`} onClick={() => setFiltro("albums")} type="button">
            Albums
          </button>
          <button className={`filtroMusica ${filtro == "singles" ? "isActive" : ""}`} onClick={() => setFiltro("singles")} type="button">
            Singles
          </button>
        </div>
      </div>
      <hr />

      {cargando && <p>Cargando música...</p>}
      {error && !cargando && <p className="errorMessage">{error}</p>}
      {!cargando && !error && lanzamientosFiltrados.length === 0 && <p>No hay lanzamientos disponibles por ahora.</p>}

      {!detalleCargando && detalleError && <p className="errorMessage">{detalleError}</p>}

      {!cargando && !error && lanzamientosFiltrados.length > 0 && (
        <div className="lanzamientos row g-4">
          {lanzamientosFiltrados.map((lanzamiento) => (
            <div key={lanzamiento.id} className="py-3 col-12 col-sm-6 col-lg-3">
              <article
                className={`lanzamiento ${detalleCargando ? "isDisabled" : ""}`}
                onClick={() => !detalleCargando && lanzarFetchDetalleYAbrir(lanzamiento)}
                role="button"
                tabIndex={0}
              >
                <div className="lanzamientoPortada">
                  <img src={lanzamiento.imagen ?? "/images/lanzamientos/ForgottenTimes.png"} alt={`Portada ${lanzamiento.titulo}`} loading="lazy" />
                </div>

                <div className="lanzamientoDatos">
                  <div className="lanzamientoFecha">
                    {lanzamiento.fechaFormateada} <span className="p-2">•</span> {lanzamiento.tipo}
                  </div>
                  <div className="lanzamientoTitulo">{lanzamiento.titulo}</div>
                </div>

                {detalleCargando && <div className="lanzamientoLoading"></div>}
              </article>
            </div>
          ))}
        </div>
      )}

      {modalOpen && lanzamientoSeleccionado && (
        <div className="releaseModalOverlay" onMouseDown={cerrarModal}>
          <div className="releaseModal d-flex flex-column" onMouseDown={(e) => e.stopPropagation()}>
            <button className="modalClose d-flex align-items-center justify-content-center" type="button" aria-label="Cerrar" onClick={cerrarModal}>
              <img src="/images/closeIcon.png" alt="" />
            </button>

            <div className="modalGrid">
              <aside className="modalLeft d-flex flex-column gap-3">
                <div className="cover">
                  <img src={lanzamientoSeleccionado.imagen ?? "/images/lanzamientos/ForgottenTimes.png"} alt={`Portada ${lanzamientoSeleccionado.titulo}`} />
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
                      {(lanzamientoSeleccionado.canciones ?? []).map((c, idx) => (
                        <li key={c.id ?? idx} className="trackRow">
                          <span className="trackName">{c.titulo}</span>
                          <span className="trackTime">{c.duracion_formateada ?? c.duracionFormateada ?? ""}</span>
                        </li>
                      ))}
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