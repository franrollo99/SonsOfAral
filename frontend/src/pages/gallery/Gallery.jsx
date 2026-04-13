import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Gallery.css";

const API_URL = import.meta.env.VITE_API_URL;

const LS_KEY = "galerias";

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

function Gallery() {
  const [galerias, setGalerias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState("all");
  const [orden, setOrden] = useState("newest");

  useEffect(() => {
    const cached = readCache(LS_KEY);

    if (Array.isArray(cached?.data)) {
      setGalerias(cached.data);
      setCargando(false);
    }

    const controller = new AbortController();

    const cargarGalerias = async () => {
      try {
        setError(null);

        const res = await fetch(`${API_URL}/galerias`, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json().catch(() => ({}));
        const raw = Array.isArray(data?.data) ? data.data : [];

        writeCache(LS_KEY, raw);
        setGalerias(raw);
      } catch (e) {
        if (e?.name !== "AbortError") {
          console.error(e);
          if (!Array.isArray(cached?.data)) {
            setError("No se pudieron cargar las galerías.");
          }
        }
      } finally {
        setCargando(false);
      }
    };

    cargarGalerias();

    return () => controller.abort();
  }, []);

  const galeriasFiltradas = useMemo(() => {
    let list = [...galerias];

    if (filtro !== "all") {
      list = list.filter((g) => (g?.tipo ?? "").toLowerCase() === filtro);
    }

    list.sort((a, b) => {
      const da = a?.concierto?.fecha ? new Date(a.concierto.fecha) : new Date(a?.createdAt ?? 0);
      const db = b?.concierto?.fecha ? new Date(b.concierto.fecha) : new Date(b?.createdAt ?? 0);

      return orden === "oldest" ? da - db : db - da;
    });

    return list;
  }, [galerias, filtro, orden]);

  const destacadas = galeriasFiltradas.length >= 7 ? galeriasFiltradas.slice(0, 4) : [];
  const resto = galeriasFiltradas.length >= 7 ? galeriasFiltradas.slice(4) : galeriasFiltradas;

  return (
    <section>
      <div className="galleryTop d-flex align-items-end justify-content-between gap-3 flex-wrap">
        <h1 className="galleryTitle">Galería</h1>

        <div className="gallerySortWrap d-flex align-items-center gap-2">
          <label className="gallerySortLabel" htmlFor="gallerySort">
            Ordenar por
          </label>
          <select
            id="gallerySort"
            className="form-select gallerySortSelect"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
          >
            <option value="newest">Más nuevo</option>
            <option value="oldest">Más antiguo</option>
          </select>
        </div>
      </div>

      <div className="galleryFilters d-flex gap-4 flex-wrap">
        <button
          type="button"
          className={`galleryFilterBtn ${filtro === "all" ? "isActive" : ""}`}
          onClick={() => setFiltro("all")}
        >
          Todas
        </button>

        <button
          type="button"
          className={`galleryFilterBtn ${filtro === "concierto" ? "isActive" : ""}`}
          onClick={() => setFiltro("concierto")}
        >
          Conciertos
        </button>

        <button
          type="button"
          className={`galleryFilterBtn ${filtro === "banda" ? "isActive" : ""}`}
          onClick={() => setFiltro("banda")}
        >
          Banda
        </button>
      </div>

      {cargando && <p className="mt-4">Cargando galerías...</p>}
      {error && !cargando && <p className="errorMessage mt-4">{error}</p>}
      {!cargando && !error && galeriasFiltradas.length === 0 && (
        <p className="mt-4">No hay galerías disponibles por ahora.</p>
      )}

      {!cargando && !error && galeriasFiltradas.length > 0 && (
        <>
          {destacadas.length > 0 && (
            <div className="galleryFeaturedGrid">
              {destacadas.map((galeria) => (
                <Link
                  key={galeria.id}
                  to={`/galeria/${galeria.id}`}
                  className="galleryCard galleryCardFeatured"
                >
                  <div className="galleryCardImageWrap">
                    <img
                      src={galeria.portada?.url}
                      srcSet={
                        galeria.portada?.urlSm
                          ? `${galeria.portada.urlSm} 500w, ${galeria.portada.url} 1400w`
                          : undefined
                      }
                      sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 33vw"
                      alt={galeria.nombre || galeria.titulo || "Galería"}
                      className="galleryCardImage"
                      loading="lazy"
                    />
                  </div>

                  <div className="galleryCardBody">
                    <div className="galleryCardMeta">
                      {galeria.concierto?.fecha || galeria.tipo}
                    </div>
                    <div className="galleryCardTitle">
                      {galeria.nombre || galeria.titulo}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="galleryGrid">
            {resto.map((galeria) => (
              <Link
                key={galeria.id}
                to={`/galeria/${galeria.id}`}
                className="galleryCard"
              >
                <div className="galleryCardImageWrap">
                  <img
                    src={galeria.portada?.url}
                    srcSet={
                      galeria.portada?.urlSm
                        ? `${galeria.portada.urlSm} 500w, ${galeria.portada.url} 1400w`
                        : undefined
                    }
                    sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 33vw"
                    alt={galeria.nombre || galeria.titulo || "Galería"}
                    className="galleryCardImage"
                    loading="lazy"
                  />
                </div>

                <div className="galleryCardBody">
                  <div className="galleryCardMeta">
                    {galeria.concierto?.fecha || galeria.tipo}
                  </div>
                  <div className="galleryCardTitle">
                    {galeria.nombre || galeria.titulo}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default Gallery;