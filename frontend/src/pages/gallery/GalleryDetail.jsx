import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./Gallery.css";

const API_URL = import.meta.env.VITE_API_URL;

function GalleryDetail() {
  const { id } = useParams();

  const [galeria, setGaleria] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const cargarGaleria = async () => {
      try {
        setError(null);
        setCargando(true);

        const res = await fetch(`${API_URL}/galerias/${id}`, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json().catch(() => ({}));
        setGaleria(data?.data ?? null);
      } catch (e) {
        if (e?.name !== "AbortError") {
          console.error(e);
          setError("No se pudo cargar la galería.");
        }
      } finally {
        setCargando(false);
      }
    };

    cargarGaleria();

    return () => controller.abort();
  }, [id]);

  const imagenes = useMemo(() => {
    return Array.isArray(galeria?.imagenes) ? galeria.imagenes : [];
  }, [galeria]);

  const abrirLightbox = (index) => {
    setLightboxIndex(index);
  };

  const cerrarLightbox = () => {
    setLightboxIndex(null);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => {
      if (prev === null || imagenes.length === 0) return null;
      return prev === 0 ? imagenes.length - 1 : prev - 1;
    });
  };

  const nextImage = () => {
    setLightboxIndex((prev) => {
      if (prev === null || imagenes.length === 0) return null;
      return prev === imagenes.length - 1 ? 0 : prev + 1;
    });
  };

  useEffect(() => {
    if (lightboxIndex === null) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") cerrarLightbox();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxIndex, imagenes.length]);

  return (
    <section>
      <div className="mb-4">
        <Link to="/galeria" className="galleryBackLink">
          ← Volver a galería
        </Link>
      </div>

      {cargando && <p>Cargando galería...</p>}
      {error && !cargando && <p className="errorMessage">{error}</p>}

      {!cargando && !error && galeria && (
        <>
          <header className="galleryDetailHeader">
            <h1 className="galleryTitle mb-2">{galeria.nombre || galeria.titulo}</h1>

            <div className="galleryDetailMeta">
              {galeria.concierto?.fecha ? <span>{galeria.concierto.fecha}</span> : null}
              {galeria.concierto?.lugar ? <span>{galeria.concierto.lugar}</span> : null}
              {galeria.concierto?.municipio ? <span>{galeria.concierto.municipio}</span> : null}
              {galeria.concierto?.provincia ? <span>{galeria.concierto.provincia}</span> : null}
            </div>
          </header>

          <div className="galleryImagesGrid">
            {imagenes.map((imagen, index) => (
              <button
                key={imagen.id ?? index}
                type="button"
                className="galleryImageCard"
                onClick={() => abrirLightbox(index)}
              >
                <img
                  src={imagen.url}
                  srcSet={
                    imagen.urlSm
                      ? `${imagen.urlSm} 500w, ${imagen.url} 1400w`
                      : undefined
                  }
                  sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 33vw"
                  alt={imagen.nombre_original || `Imagen ${index + 1}`}
                  className="galleryImage"
                  loading="lazy"
                />
              </button>
            ))}
          </div>

          {imagenes.length === 0 && (
            <p>No hay imágenes en esta galería todavía.</p>
          )}
        </>
      )}

      {lightboxIndex !== null && imagenes[lightboxIndex] && (
        <div className="lightboxOverlay" onMouseDown={cerrarLightbox}>
          <div className="lightboxInner" onMouseDown={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightboxClose"
              onClick={cerrarLightbox}
              aria-label="Cerrar"
            >
              ✕
            </button>

            {imagenes.length > 1 && (
              <>
                <button
                  type="button"
                  className="lightboxNav lightboxNavPrev"
                  onClick={prevImage}
                  aria-label="Imagen anterior"
                >
                  ‹
                </button>

                <button
                  type="button"
                  className="lightboxNav lightboxNavNext"
                  onClick={nextImage}
                  aria-label="Imagen siguiente"
                >
                  ›
                </button>
              </>
            )}

            <img
              src={imagenes[lightboxIndex].url}
              alt={imagenes[lightboxIndex].nombre_original || "Imagen"}
              className="lightboxImage"
            />

            <div className="lightboxCounter">
              {lightboxIndex + 1} / {imagenes.length}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default GalleryDetail;