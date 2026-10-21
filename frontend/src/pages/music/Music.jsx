import { imageSrcSet } from "../../lib/images";
import { useContent } from "../../hooks/useContent";
import { useMemo, useState } from "react";
import "./Music.css";
import ReleaseModal from "../../components/ReleaseModal";

function normalizeOrdered(raw) {
  return [...raw].sort((a, b) => {
    const da = a?.fechaLanzamiento ? new Date(a.fechaLanzamiento) : new Date(0);
    const db = b?.fechaLanzamiento ? new Date(b.fechaLanzamiento) : new Date(0);
    return db - da;
  });
}

function Musica() {
  const { data, loading: cargando, error } = useContent("/lanzamientos");
  const lanzamientos = useMemo(
    () => normalizeOrdered(Array.isArray(data) ? data : []),
    [data],
  );
  const [filtro, setFiltro] = useState("all");

  const [lanzamientoSeleccionado, setLanzamientoSeleccionado] = useState(null);

  const abrirModal = (lanzamiento) => setLanzamientoSeleccionado(lanzamiento);

  const lanzamientosFiltrados = useMemo(() => {
    const f = (filtro ?? "all").toLowerCase();
    if (f === "all") return lanzamientos;
    const tipoBuscado = f === "all" ? "all" : f;
    return lanzamientos.filter(
      (l) => (l?.tipo ?? "").toLowerCase() === tipoBuscado,
    );
  }, [lanzamientos, filtro]);

  const filtrosVisibles = useMemo(() => {
    const tipos = new Set();

    for (const lanzamiento of lanzamientos) {
      const tipo = String(lanzamiento?.tipo || "").toLowerCase();
      if (tipo) tipos.add(tipo);
    }

    const items = [{ value: "all", label: "Todos" }];

    if (tipos.has("album")) items.push({ value: "album", label: "Álbum" });
    if (tipos.has("ep")) items.push({ value: "ep", label: "EP" });
    if (tipos.has("single")) items.push({ value: "single", label: "Single" });

    return items;
  }, [lanzamientos]);

  return (
    <section className="musicPage">
      <header className="musicHeader">
        <h1 className="visually-hidden">Música</h1>

        <div
          className="musicFilters d-flex flex-wrap gap-2"
          role="group"
          aria-label="Filtrar lanzamientos"
        >
          {filtrosVisibles.map((item) => (
            <button
              key={item.value}
              className={`filtroMusica ${filtro === item.value ? "isActive" : ""}`}
              onClick={() => setFiltro(item.value)}
              type="button"
              aria-pressed={filtro === item.value}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {cargando && <p role="status">Cargando música...</p>}
      {error && !cargando && (
        <p className="errorMessage" role="alert">
          {error}
        </p>
      )}
      {!cargando && !error && lanzamientosFiltrados.length === 0 && (
        <p>No hay lanzamientos disponibles por ahora.</p>
      )}

      {!cargando && !error && lanzamientosFiltrados.length > 0 && (
        <div className="lanzamientos row g-4">
          {lanzamientosFiltrados.map((lanzamiento) => (
            <div key={lanzamiento.id} className="py-3 col-12 col-sm-6 col-lg-3">
              <article
                className="lanzamiento"
                onClick={() => abrirModal(lanzamiento)}
                role="button"
                aria-label={`Ver lanzamiento ${lanzamiento.titulo}`}
                aria-haspopup="dialog"
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    abrirModal(lanzamiento);
                  }
                }}
                tabIndex={0}
              >
                <div className="lanzamientoPortada">
                  <img
                    src={lanzamiento.portada?.url}
                    srcSet={imageSrcSet(lanzamiento.portada)}
                    sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 25vw"
                    alt={`Portada ${lanzamiento.titulo}`}
                    loading="lazy"
                  />
                </div>

                <div className="lanzamientoDatos">
                  <div className="lanzamientoFecha">
                    {lanzamiento.fechaFormateada} <span className="p-2">•</span>{" "}
                    {lanzamiento.tipo}
                  </div>
                  <div className="lanzamientoTitulo">{lanzamiento.titulo}</div>
                </div>
              </article>
            </div>
          ))}
        </div>
      )}

      {lanzamientoSeleccionado && (
        <ReleaseModal
          lanzamiento={lanzamientoSeleccionado}
          onClose={() => setLanzamientoSeleccionado(null)}
        />
      )}
    </section>
  );
}

export default Musica;
