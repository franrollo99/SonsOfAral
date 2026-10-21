import { imageSrcSet } from "../../lib/images";
import { useContent } from "../../hooks/useContent";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Gallery.css";

function Gallery() {
  const { data, loading: cargando, error } = useContent("/galerias");
  const galerias = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const [filtro, setFiltro] = useState("all");
  const [orden, setOrden] = useState("newest");

  const galeriasFiltradas = useMemo(() => {
    let list = [...galerias];

    if (filtro !== "all") {
      list = list.filter((g) => (g?.tipo ?? "").toLowerCase() === filtro);
    }

    list.sort((a, b) => {
      const da = a?.concierto?.fecha
        ? new Date(a.concierto.fecha)
        : new Date(a?.createdAt ?? 0);
      const db = b?.concierto?.fecha
        ? new Date(b.concierto.fecha)
        : new Date(b?.createdAt ?? 0);

      return orden === "oldest" ? da - db : db - da;
    });

    return list;
  }, [galerias, filtro, orden]);

  const destacadas =
    galeriasFiltradas.length >= 7 ? galeriasFiltradas.slice(0, 4) : [];
  const resto =
    galeriasFiltradas.length >= 7
      ? galeriasFiltradas.slice(4)
      : galeriasFiltradas;

  return (
    <section className="galleryPage">
      <h1 className="visually-hidden">Galería</h1>

      <div className="galleryToolbar">
        <div
          className="galleryFilters"
          role="group"
          aria-label="Filtrar galerías"
        >
          <button
            type="button"
            className={`galleryFilterBtn ${filtro === "all" ? "isActive" : ""}`}
            aria-pressed={filtro === "all"}
            onClick={() => setFiltro("all")}
          >
            Todas
          </button>

          <button
            type="button"
            className={`galleryFilterBtn ${filtro === "concierto" ? "isActive" : ""}`}
            aria-pressed={filtro === "concierto"}
            onClick={() => setFiltro("concierto")}
          >
            Conciertos
          </button>

          <button
            type="button"
            className={`galleryFilterBtn ${filtro === "banda" ? "isActive" : ""}`}
            aria-pressed={filtro === "banda"}
            onClick={() => setFiltro("banda")}
          >
            Banda
          </button>
        </div>

        <div className="gallerySortWrap">
          <label className="gallerySortLabel" htmlFor="gallerySort">
            Ordenar por
          </label>
          <select
            id="gallerySort"
            className="gallerySortSelect"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
          >
            <option value="newest">Más nuevo</option>
            <option value="oldest">Más antiguo</option>
          </select>
        </div>
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
                      srcSet={imageSrcSet(galeria.portada)}
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
                    srcSet={imageSrcSet(galeria.portada)}
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
