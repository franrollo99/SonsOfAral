import { imageSrcSet } from "../../lib/images";
import { useContent } from "../../hooks/useContent";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./Gallery.css";
import { useModal } from "../../hooks/useModal";
import ImageViewerClose from "../../components/ImageViewerClose";

function GalleryDetail() {
  const { id } = useParams();

  const {
    data: galeria,
    loading: cargando,
    error,
  } = useContent(`/galerias/${id}`);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const swipeStart = useRef(null);
  const suppressSwipeClick = useRef(false);

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

  const startSwipe = (event) => {
    swipeStart.current = null;
    suppressSwipeClick.current = false;

    if (
      event.pointerType !== "touch" ||
      !event.isPrimary ||
      imagenes.length < 2 ||
      event.target.closest("button")
    ) {
      return;
    }

    swipeStart.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
  };

  const finishSwipe = (event) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start || start.id !== event.pointerId) return;

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.3) {
      return;
    }

    // Touch browsers may emit a click after a swipe; do not close or advance twice.
    suppressSwipeClick.current = true;
    if (deltaX < 0) nextImage();
    else prevImage();
  };

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
                  sizes="(max-width: 700px) 50vw, 33vw"
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
        <div
          className="lightboxOverlay"
          onClick={(event) => {
            if (!event.target.closest("img, button")) cerrarLightbox();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Imágenes de ${galeria?.nombre || galeria?.titulo || "la galería"}`}
            tabIndex={-1}
            className="lightboxInner"
            onPointerDown={startSwipe}
            onPointerUp={finishSwipe}
            onPointerCancel={() => {
              swipeStart.current = null;
              suppressSwipeClick.current = false;
            }}
            onClickCapture={(event) => {
              if (!suppressSwipeClick.current) return;
              suppressSwipeClick.current = false;
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            <ImageViewerClose onClose={cerrarLightbox} />

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
              draggable={false}
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
