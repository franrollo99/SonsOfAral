import { imageSrcSet } from "../../lib/images";
import { useContent } from "../../hooks/useContent";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./Gallery.css";
import { useModal } from "../../hooks/useModal";

function GalleryDetail() {
  const { id } = useParams();

  const {
    data: galeria,
    loading: cargando,
    error,
  } = useContent(`/galerias/${id}`);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const imagenes = useMemo(() => {
    return Array.isArray(galeria?.imagenes) ? galeria.imagenes : [];
  }, [galeria]);

  const abrirLightbox = (index) => {
    setLightboxIndex(index);
  };

  const cerrarLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const prevImage = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null || imagenes.length === 0) return null;
      return prev === 0 ? imagenes.length - 1 : prev - 1;
    });
  }, [imagenes.length]);

  const nextImage = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null || imagenes.length === 0) return null;
      return prev === imagenes.length - 1 ? 0 : prev + 1;
    });
  }, [imagenes.length]);

  const lightboxOpen = lightboxIndex !== null && !!imagenes[lightboxIndex];
  const dialogRef = useModal(lightboxOpen, cerrarLightbox);

  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevImage();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        nextImage();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen, nextImage, prevImage]);

  return (
    <section>
      <div className="mb-4">
        <Link to="/galeria" className="galleryBackLink">
          ← Volver a galería
        </Link>
      </div>

      {cargando && <p role="status">Cargando galería...</p>}
      {error && !cargando && (
        <p className="errorMessage" role="alert">
          {error}
        </p>
      )}

      {!cargando && !error && galeria && (
        <>
          <header className="galleryDetailHeader">
            <h1 className="galleryTitle mb-2">
              {galeria.nombre || galeria.titulo}
            </h1>

            <div className="galleryDetailMeta">
              {galeria.concierto?.fecha ? (
                <span>{galeria.concierto.fecha}</span>
              ) : null}
              {galeria.concierto?.lugar ? (
                <span>{galeria.concierto.lugar}</span>
              ) : null}
              {galeria.concierto?.municipio ? (
                <span>{galeria.concierto.municipio}</span>
              ) : null}
              {galeria.concierto?.provincia ? (
                <span>{galeria.concierto.provincia}</span>
              ) : null}
            </div>
          </header>

          <div className="galleryImagesGrid">
            {imagenes.map((imagen, index) => (
              <button
                key={imagen.id ?? index}
                type="button"
                aria-label={`Abrir imagen ${index + 1}`}
                aria-haspopup="dialog"
                className="galleryImageCard"
                onClick={() => abrirLightbox(index)}
              >
                <img
                  src={imagen.url}
                  srcSet={imageSrcSet(imagen)}
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
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Imágenes de ${galeria?.nombre || galeria?.titulo || "la galería"}`}
            tabIndex={-1}
            className="lightboxInner"
            onMouseDown={(e) => e.stopPropagation()}
          >
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

            <div className="lightboxCounter" role="status" aria-atomic="true">
              {lightboxIndex + 1} / {imagenes.length}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default GalleryDetail;
