import { useEffect, useMemo, useState } from "react";
import "./Musica.css";

export function Musica() {
  const [lanzamientos, setLanzamientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState("all");

  useEffect(() => {
    async function cargarLanzamientos() {
      try {
        setCargando(true);
        setError(null);

        const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
        const res = await fetch(`${baseUrl}/lanzamientos`);
        if (!res.ok) throw new Error("Error al cargar lanzamientos");

        const data = await res.json();
        const lista = Array.isArray(data) ? data : data.data;
        setLanzamientos(lista || []);
      } catch (e) {
        setError("No se pudieron cargar los discos.");
      } finally {
        setCargando(false);
      }
    }

    cargarLanzamientos();
  }, []);

  // useMemo memoriza el resultado para no repetirlo en cada render si los datos no han cambiado
  const lanzamientosFiltrados = useMemo(() => {
    if (filtro === "all") return lanzamientos;
    if (filtro === "albums") return lanzamientos.filter(l => l.tipo == "album");
    if (filtro === "singles") return lanzamientos.filter(l => l.tipo == "single");
    return lanzamientos;
  }, [lanzamientos, filtro]);

  return (
    <section className="section musica">
      <div className="d-flex align-items-end justify-content-between gap-3">
        <h1>Explorar lanzamientos</h1>

        <div className="d-flex flex-wrap justify-content-end gap-2">
          <button className={`filtroMusica ${filtro == "all" ? "isActive" : ""}`} onClick={() => setFiltro("all")} type="button">All</button>
          <button className={`filtroMusica ${filtro == "albums" ? "isActive" : ""}`} onClick={() => setFiltro("albums")} type="button">Albums</button>
          <button className={`filtroMusica ${filtro == "singles" ? "isActive" : ""}`} onClick={() => setFiltro("singles")} type="button">Singles</button>
        </div>
      </div>
      <hr />

      {cargando && <p>Cargando música...</p>}
      {error && !cargando && <p className="errorMessage">{error}</p>}
      {!cargando && !error && lanzamientosFiltrados.length === 0 && (<p>No hay lanzamientos disponibles por ahora.</p>)}

      {!cargando && !error && lanzamientosFiltrados.length > 0 && (
        <div className="row g-4">
          {lanzamientosFiltrados.map((lanzamiento) => (
            <div key={lanzamiento.id} className="py-3 col-12 col-sm-6 col-lg-3">
              <article className="lanzamiento">
                <div className="lanzamientoPortada">
                  {/* loading lazy descarga las imagenes cuando el usuario se acerca a ellas al hacer scroll */}
                  <img src={lanzamiento.imagen_url ?? "/images/lanzamientos/ForgottenTimes.png"} alt={`Portada ${lanzamiento.titulo}`} loading="lazy" />
                </div>

                <div className="lanzamientoDatos">
                  <div className="lanzamientoFecha">{lanzamiento.fechaFormateada} <span className="p-2">•</span> {lanzamiento.tipo}</div>
                  <div className="lanzamientoTitulo">{lanzamiento.titulo}</div>
                </div>
              </article>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Musica;
